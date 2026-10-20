import "server-only";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";
import { getDb } from "@/lib/db/mongo";

// Referral + sweepstakes model.
//
// • Every signed-in player (and the admin console on request) is
//   issued a stable `referralCodes` row with a short, URL-friendly
//   code. Visitors land on /r/<code> → the code is set in a cookie
//   → cookie is applied as `source=referral/<code>` on next signup /
//   subscription so the attribution happens even if the user wanders
//   around first.
//
// • `referralEvents` records every verified touchpoint:
//     - "click"   : visitor hit /r/<code>
//     - "signup"  : visitor completed account signup bearing the cookie
//     - "subscribe": visitor confirmed newsletter subscription
//     - "amoe"    : free alternative method of entry (equal weight)
//
// • A `giveawayRounds` row aggregates verified events into buckets of
//   100 and runs the draw. Admin creates and seals a round; the engine
//   picks 50 objective qualifiers and 1 random winner. All randomness
//   sourced from Node crypto.randomBytes (not Math.random).

export type ReferralEventKind = "click" | "signup" | "subscribe" | "amoe";

export interface ReferralCode {
  _id?: ObjectId;
  code: string;
  playerId?: string;      // null for staff-issued / public campaign codes
  issuedTo?: string;      // descriptive label when playerId is absent
  createdAt: string;
  active: boolean;
}

export interface ReferralEvent {
  _id?: ObjectId;
  id: string;
  code: string;
  kind: ReferralEventKind;
  // Who the event credits (player who shared / entered). Null for raw
  // clicks that never converted.
  attributedPlayerId?: string;
  // Visitor identity for de-duplication across clicks + conversions.
  // Hashed cookie id, not a tracking identifier.
  visitorHash: string;
  // Marked verified when the pipeline is confident this is not a bot
  // or self-referral. Only verified events feed the qualifier count.
  verified: boolean;
  reason?: string;        // why it was/wasn't verified
  ipHash?: string;        // hashed, for duplicate-IP filtering
  userAgentHash?: string;
  createdAt: string;
  roundId?: string;       // set when enrolled in a drawing round
}

export type GiveawayRoundStatus =
  | "collecting"   // open, counting verified events
  | "sealed"       // frozen; qualifier algorithm has run
  | "drawn"        // winner picked
  | "notified"     // winner emailed, prize claim window open
  | "awarded"      // prize sent / confirmed
  | "cancelled";

export interface GiveawayRound {
  _id?: ObjectId;
  id: string;
  index: number;          // sequential: round 1, 2, 3...
  threshold: number;      // owner spec: 100 verified events = 1 round
  qualifierTarget: number; // owner spec: 50 qualifiers
  prize: string;          // owner spec default: "Royal Checkers – Two-Color Board & Checkers Set"
  status: GiveawayRoundStatus;
  startedAt: string;
  sealedAt?: string;
  drawnAt?: string;
  qualifierPlayerIds?: string[];
  winnerPlayerId?: string;
  winnerEmail?: string;
  // Public-rules fields set at round creation so winners can see what
  // rules governed them.
  rulesVersion: string;
  rulesUrl: string;
  // Prize-claim timer. Owner can set a window (72 h default).
  claimDeadline?: string;
}

export async function ensureReferralIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<ReferralCode>("referralCodes").createIndex({ code: 1 }, { unique: true }),
    db.collection<ReferralCode>("referralCodes").createIndex({ playerId: 1 }),
    db.collection<ReferralEvent>("referralEvents").createIndex({ code: 1, createdAt: -1 }),
    db.collection<ReferralEvent>("referralEvents").createIndex({ visitorHash: 1, kind: 1 }),
    db.collection<ReferralEvent>("referralEvents").createIndex({ verified: 1, roundId: 1 }),
    db.collection<GiveawayRound>("giveawayRounds").createIndex({ id: 1 }, { unique: true }),
    db.collection<GiveawayRound>("giveawayRounds").createIndex({ status: 1, startedAt: -1 }),
  ]);
}

/* --------------------------- Codes --------------------------- */

export function newCode(): string {
  // 7 chars from an unambiguous alphabet (no 0/O/1/I). ~22 bits of
  // entropy per code — enough to avoid birthday collisions well
  // past the owner's expected scale while staying short enough to
  // say over a phone call.
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(7);
  let out = "";
  for (let i = 0; i < 7; i++) out += alpha[bytes[i] % alpha.length];
  return out;
}

export async function getOrCreateCodeForPlayer(playerId: string): Promise<ReferralCode> {
  const db = await getDb();
  const existing = await db.collection<ReferralCode>("referralCodes").findOne({ playerId });
  if (existing) return existing;
  for (let i = 0; i < 10; i++) {
    try {
      const row: ReferralCode = {
        code: newCode(),
        playerId,
        createdAt: new Date().toISOString(),
        active: true,
      };
      await db.collection<ReferralCode>("referralCodes").insertOne(row);
      return row;
    } catch { /* collision — retry */ }
  }
  throw new Error("could not allocate referral code after 10 attempts");
}

export async function findCode(code: string): Promise<ReferralCode | null> {
  const db = await getDb();
  return db.collection<ReferralCode>("referralCodes").findOne({ code });
}

/* --------------------------- Events --------------------------- */

export async function recordEvent(e: Omit<ReferralEvent, "_id" | "id" | "createdAt">): Promise<ReferralEvent> {
  const db = await getDb();
  const row: ReferralEvent = {
    ...e,
    id: `${Date.now()}-${randomBytes(4).toString("hex")}`,
    createdAt: new Date().toISOString(),
  };
  await db.collection<ReferralEvent>("referralEvents").insertOne(row);
  return row;
}

export async function countVerifiedUnrounded(): Promise<number> {
  const db = await getDb();
  return db.collection<ReferralEvent>("referralEvents").countDocuments({
    verified: true,
    roundId: { $exists: false },
    kind: { $in: ["signup", "subscribe", "amoe"] },
  });
}

/* -------------------------- Rounds ---------------------------- */

export async function listRounds(): Promise<GiveawayRound[]> {
  const db = await getDb();
  return db.collection<GiveawayRound>("giveawayRounds")
    .find({}, { projection: { _id: 0 } })
    .sort({ index: -1 }).toArray();
}

export async function createRound(opts: Omit<GiveawayRound, "_id" | "id" | "startedAt" | "status">): Promise<GiveawayRound> {
  const db = await getDb();
  const row: GiveawayRound = {
    ...opts,
    id: `${Date.now()}-${randomBytes(4).toString("hex")}`,
    startedAt: new Date().toISOString(),
    status: "collecting",
  };
  await db.collection<GiveawayRound>("giveawayRounds").insertOne(row);
  return row;
}

export async function updateRound(id: string, patch: Partial<GiveawayRound>): Promise<void> {
  const db = await getDb();
  await db.collection<GiveawayRound>("giveawayRounds").updateOne({ id }, { $set: patch });
}
