import "server-only";

// Optional QStash scheduling wrapper for timezone-safe tournament
// start / round-advancement callbacks. When QSTASH_TOKEN is unset,
// scheduling is a no-op and the state machine falls back to lazy
// transitions on access (which is sufficient for Phase 5 DoD).

type ScheduleOpts = {
  // URL to POST to at the scheduled time.
  url: string;
  // ISO string; QStash will fire within a few seconds of this.
  at: string;
  // Opaque body passed to the handler.
  body?: Record<string, unknown>;
};

export function hasQstash(): boolean {
  return !!process.env.QSTASH_TOKEN && !!process.env.QSTASH_URL;
}

export async function scheduleOnce(opts: ScheduleOpts): Promise<string | null> {
  if (!hasQstash()) return null;
  try {
    const delayMs = Math.max(0, new Date(opts.at).getTime() - Date.now());
    const delaySeconds = Math.ceil(delayMs / 1000);
    const res = await fetch(`${process.env.QSTASH_URL}/v2/publish/${encodeURIComponent(opts.url)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        "Content-Type": "application/json",
        "Upstash-Delay": `${delaySeconds}s`,
      },
      body: JSON.stringify(opts.body ?? {}),
    });
    if (!res.ok) {
      console.warn("qstash scheduleOnce failed:", await res.text());
      return null;
    }
    const data = (await res.json()) as { messageId?: string };
    return data.messageId ?? null;
  } catch (err) {
    console.warn("qstash scheduleOnce error:", err instanceof Error ? err.message : err);
    return null;
  }
}
