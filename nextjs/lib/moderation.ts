// Pure helper + optional HTTP call — no DB, no secrets of our own
// (reads PERSPECTIVE_API_KEY only). Importable from any context,
// including smoke tests. API routes call this through server-only
// callers (api/messages/route.ts etc.).
//
// Thin wrapper around the Perspective API for message moderation.
// Also exposes a stub for AWS Rekognition / Hive image moderation
// (unused at launch — F27 video / image uploads are Phase 7+).
//
// Falls back to a regex-based blocklist when PERSPECTIVE_API_KEY is
// unset. The blocklist is deliberately conservative — the real
// moderation line is drawn by human moderators via /admin/reports.

export type ModerationVerdict =
  | { status: "clean" }
  | { status: "flagged"; reason: string; score?: number }
  | { status: "blocked"; reason: string; score?: number };

const SIMPLE_BLOCKS = [
  /\b(f[u*]ck|sh[i*]t|b[i*]tch|c[u*]nt|n[i*]gg[ae]r)\b/i,
  // Phone numbers / emails — don't allow minors to share contact info.
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/,
];

const SIMPLE_FLAGS = [
  /\b(?:kill\s+yourself|k[iy][sz]|retard|idiot)\b/i,
];

export async function moderateText(body: string): Promise<ModerationVerdict> {
  const trimmed = body.trim();
  if (!trimmed) return { status: "blocked", reason: "empty" };
  if (trimmed.length > 2000) return { status: "blocked", reason: "too long" };

  // Fast local pre-screen.
  for (const re of SIMPLE_BLOCKS) {
    if (re.test(trimmed)) return { status: "blocked", reason: "contains disallowed content" };
  }
  for (const re of SIMPLE_FLAGS) {
    if (re.test(trimmed)) return { status: "flagged", reason: "potentially hostile language" };
  }

  // Perspective API — toxicity > 0.85 blocks, > 0.6 flags.
  const key = process.env.PERSPECTIVE_API_KEY;
  if (key) {
    try {
      const r = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: { text: trimmed },
            requestedAttributes: { TOXICITY: {}, SEVERE_TOXICITY: {}, INSULT: {}, THREAT: {} },
            doNotStore: true,
          }),
        },
      );
      if (r.ok) {
        const data = await r.json() as {
          attributeScores?: Record<string, { summaryScore?: { value: number } }>;
        };
        const scores = data.attributeScores ?? {};
        const toxic = scores.TOXICITY?.summaryScore?.value ?? 0;
        const severe = scores.SEVERE_TOXICITY?.summaryScore?.value ?? 0;
        const threat = scores.THREAT?.summaryScore?.value ?? 0;
        const score = Math.max(toxic, severe, threat);
        if (severe > 0.75 || threat > 0.75 || toxic > 0.85) {
          return { status: "blocked", reason: "flagged by content safety", score };
        }
        if (toxic > 0.6) {
          return { status: "flagged", reason: "elevated toxicity score", score };
        }
      }
    } catch (err) {
      console.warn("perspective api error:", err instanceof Error ? err.message : err);
    }
  }

  return { status: "clean" };
}

/** Image/video moderation stub for later phases. */
export async function moderateImage(_url: string): Promise<ModerationVerdict> {
  return { status: "clean" };
}
