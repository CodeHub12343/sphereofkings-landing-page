import "server-only";
import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/db/mongo";
import {
  countVerifiedUnrounded, GiveawayRound, ReferralEvent,
  updateRound,
} from "@/lib/db/collections/referrals";

// Qualifier + draw engine. Deliberately simple and auditable so the
// rules can be published verbatim in /sweepstakes:
//
//  1. All verified unrounded events are eligible.
//  2. One qualifier per distinct player (dedupe by attributedPlayerId;
//     AMOE events without a player fall back to visitorHash).
//  3. Deterministic sort: oldest verified event per entrant first,
//     with ties broken by SHA-256(entrantId + round.id).
//  4. The top N (owner spec: 50) are the qualifiers.
//  5. Winner selected uniformly from the qualifier list using
//     crypto.randomBytes — not Math.random, not seeded.
//  6. All selected events are stamped with `roundId` so they can't
//     feed a future round.

export async function sealAndQualify(
  round: GiveawayRound,
): Promise<{ qualifiers: string[]; eventIds: string[] }> {
  const db = await getDb();
  const events = await db.collection<ReferralEvent>("referralEvents")
    .find({
      verified: true,
      roundId: { $exists: false },
      kind: { $in: ["signup", "subscribe", "amoe"] },
    })
    .sort({ createdAt: 1 })
    .limit(round.threshold * 4) // generous ceiling to allow for dedupe
    .toArray();

  // One entrant per distinct player (or distinct visitorHash for
  // AMOE / non-player entries). Keep the earliest event only.
  const byEntrant = new Map<string, ReferralEvent>();
  for (const e of events) {
    const key = e.attributedPlayerId ?? `visitor:${e.visitorHash}`;
    if (!byEntrant.has(key)) byEntrant.set(key, e);
    if (byEntrant.size >= round.threshold) break;
  }
  if (byEntrant.size < round.threshold) {
    throw new Error(
      `Not enough verified entrants to seal: ${byEntrant.size} / ${round.threshold}.`,
    );
  }

  // Stable deterministic ordering so the draw is reproducible later
  // from the published rules: by (createdAt, SHA256(entrant + roundId)).
  const entrants = Array.from(byEntrant.entries()).map(([entrantId, ev]) => ({
    entrantId,
    createdAt: ev.createdAt,
    tie: createHash("sha256").update(entrantId + "|" + round.id).digest("hex"),
    event: ev,
  }));
  entrants.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.tie.localeCompare(b.tie));

  const qualifiers = entrants.slice(0, round.qualifierTarget).map((e) => e.entrantId);
  const selectedEvents = entrants.map((e) => e.event);

  await db.collection<ReferralEvent>("referralEvents").updateMany(
    { id: { $in: selectedEvents.map((e) => e.id) } },
    { $set: { roundId: round.id } },
  );

  await updateRound(round.id, {
    status: "sealed",
    sealedAt: new Date().toISOString(),
    qualifierPlayerIds: qualifiers,
  });

  return {
    qualifiers,
    eventIds: selectedEvents.map((e) => e.id),
  };
}

/** Cryptographically-random uniform pick from an array. */
export function pickRandom<T>(items: T[]): T {
  if (items.length === 0) throw new Error("pickRandom: empty");
  // Rejection sampling to avoid modulo bias.
  const n = items.length;
  const limit = Math.floor(0x100000000 / n) * n;
  let r: number;
  do {
    r = randomBytes(4).readUInt32BE(0);
  } while (r >= limit);
  return items[r % n];
}

export async function drawWinner(round: GiveawayRound): Promise<string> {
  if (!round.qualifierPlayerIds || round.qualifierPlayerIds.length === 0) {
    throw new Error("drawWinner: round has no qualifiers; seal first");
  }
  const winner = pickRandom(round.qualifierPlayerIds);
  await updateRound(round.id, {
    status: "drawn",
    drawnAt: new Date().toISOString(),
    winnerPlayerId: winner,
  });
  return winner;
}

/* ------------- Visitor hashing (per-cookie, not per-user) ------------- */

export function hashVisitor(cookieId: string): string {
  const salt = process.env.VISITOR_HASH_SALT ?? "sok-default-salt-change-in-env";
  return createHash("sha256").update(salt + "|" + cookieId).digest("hex").slice(0, 32);
}

export function hashIp(ip: string | null | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.VISITOR_HASH_SALT ?? "sok-default-salt-change-in-env";
  return createHash("sha256").update(salt + "|ip|" + ip).digest("hex").slice(0, 32);
}

/* ------------- Verification: filters bots + self-referral ------------ */

export interface VerifyContext {
  code: string;
  attributedPlayerId?: string;
  codeOwnerPlayerId?: string;
  visitorHash: string;
  ipHash?: string;
  userAgent?: string;
}

export async function verifyEvent(ctx: VerifyContext, kind: "signup" | "subscribe" | "amoe"): Promise<{ verified: boolean; reason?: string }> {
  // Self-referral is disallowed.
  if (ctx.attributedPlayerId && ctx.codeOwnerPlayerId &&
      ctx.attributedPlayerId === ctx.codeOwnerPlayerId) {
    return { verified: false, reason: "self-referral" };
  }
  // Simple bot heuristics on the User-Agent.
  const ua = (ctx.userAgent ?? "").toLowerCase();
  if (!ua || ua.includes("bot") || ua.includes("crawler") || ua.includes("spider") || ua.includes("curl") || ua.includes("python")) {
    return { verified: false, reason: "bot-user-agent" };
  }
  // Rate: no more than one verified event per visitorHash per kind.
  const db = await getDb();
  const dupe = await db.collection<ReferralEvent>("referralEvents").findOne({
    visitorHash: ctx.visitorHash,
    kind,
    verified: true,
  });
  if (dupe) return { verified: false, reason: "duplicate-visitor" };
  // Cap: at most 20 verified events per IP across all kinds. Beyond
  // that, mark unverified pending manual review.
  if (ctx.ipHash) {
    const ipCount = await db.collection<ReferralEvent>("referralEvents").countDocuments({
      ipHash: ctx.ipHash, verified: true,
    });
    if (ipCount >= 20) return { verified: false, reason: "ip-cap" };
  }
  return { verified: true };
}

export function newCookieId(): string {
  return randomBytes(16).toString("hex");
}
