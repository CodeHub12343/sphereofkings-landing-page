import "server-only";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/mongo";

// Event logger. Writes to Mongo + mirrors to Vercel Analytics
// (`@vercel/analytics` is loaded only if the env + package exist).
//
// Events are coarse: pageview, click, game-start, game-finish,
// tournament-register, blog-view, custom-sphere-order, etc.
// They are NOT per-mouse-movement traces — a few per session.

export interface AnalyticsEvent {
  id: string;
  type: string;
  playerId?: string;
  anonymousSessionId?: string;
  path?: string;
  payload?: Record<string, string | number | boolean | undefined>;
  createdAt: string;
  userAgent?: string;
  referrer?: string;
}

export async function logEvent(ev: Omit<AnalyticsEvent, "id" | "createdAt">): Promise<void> {
  try {
    const db = await getDb();
    await db.collection<AnalyticsEvent>("analyticsEvents").insertOne({
      ...ev,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Analytics failures are never user-facing.
  }
}

export async function summarise(opts: {
  since: string;
  until?: string;
  type?: string;
}): Promise<{ total: number; byType: Record<string, number>; byDay: Record<string, number> }> {
  const db = await getDb();
  const q: Record<string, unknown> = { createdAt: { $gte: opts.since } };
  if (opts.until) (q.createdAt as Record<string, string>).$lte = opts.until;
  if (opts.type) q.type = opts.type;
  const docs = await db.collection<AnalyticsEvent>("analyticsEvents")
    .find(q, { projection: { type: 1, createdAt: 1, _id: 0 } })
    .limit(50_000).toArray();
  const byType: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  for (const d of docs) {
    byType[d.type] = (byType[d.type] ?? 0) + 1;
    const day = d.createdAt.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  return { total: docs.length, byType, byDay };
}
