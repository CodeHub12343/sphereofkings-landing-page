import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// A "creator" is an influencer enrolled in Sphere of Kings Creator Kingdom.
// Creator identity rides on an existing player account (same signin flow),
// so no second auth system is needed. The creator profile holds the parts
// that only apply once an application is submitted: eligibility, social
// accounts, achievement tier, agreement signature, country, etc.

export type CreatorApplicationState =
  | "pending"     // waiting for admin review
  | "approved"    // admin approved; can accept assignments
  | "rejected"    // admin rejected
  | "suspended";  // admin suspended for fraud / policy

export type CreatorTier =
  | "Royal Creator"
  | "Imperial Creator"
  | "Kingdom Ambassador"
  | "Royal Legend";

export interface SocialAccount {
  platform: "tiktok" | "instagram" | "facebook" | "youtube";
  handle: string;                 // without @
  url: string;                    // full profile URL
  followers: number;              // self-reported, verified at review time
  verified: boolean;              // ownership verified
  verifiedAt?: string;
}

export interface Creator {
  _id?: ObjectId;
  id: string;                     // same as playerId
  playerId: string;
  playerUsername: string;
  email: string;
  displayName: string;
  country: string;                // ISO alpha-2
  contentCategory: string;        // games, family, lifestyle, etc.
  socialAccounts: SocialAccount[];
  state: CreatorApplicationState;
  tier: CreatorTier;
  // Immutable snapshot of what the creator agreed to when accepting
  // program terms. Keyed by terms version.
  agreementsAccepted: { version: string; acceptedAt: string }[];
  // Referral
  referralCode: string;           // unique; used as ?ref=
  referralClicks: number;
  referralConversions: number;
  // Totals (derived, incremented cheaply)
  lifetimeProductsEarned: number;
  lifetimePostsApproved: number;
  // Credits (also mirrored in ledger — see creator-credits.ts)
  creditsBalance: number;
  // Admin notes (reviewer only)
  adminNotes?: string;
  flags: string[];                // e.g. "fake-followers", "duplicate-account"
  createdAt: string;
  updatedAt: string;
}

export async function ensureCreatorIndexes(): Promise<void> {
  const db = await getDb();
  const c = db.collection<Creator>("creators");
  await Promise.all([
    c.createIndex({ id: 1 }, { unique: true }),
    c.createIndex({ playerId: 1 }, { unique: true }),
    c.createIndex({ email: 1 }, { unique: true }),
    c.createIndex({ referralCode: 1 }, { unique: true }),
    c.createIndex({ state: 1, updatedAt: -1 }),
    c.createIndex({ "socialAccounts.platform": 1, "socialAccounts.handle": 1 }),
  ]);
}

export async function insertCreator(row: Creator): Promise<void> {
  const db = await getDb();
  await db.collection<Creator>("creators").insertOne(row);
}
export async function getCreator(id: string): Promise<Creator | null> {
  const db = await getDb();
  return db.collection<Creator>("creators").findOne({ id }, { projection: { _id: 0 } });
}
export async function getCreatorByPlayerId(playerId: string): Promise<Creator | null> {
  const db = await getDb();
  return db.collection<Creator>("creators").findOne({ playerId }, { projection: { _id: 0 } });
}
export async function getCreatorByReferral(code: string): Promise<Creator | null> {
  const db = await getDb();
  return db.collection<Creator>("creators").findOne({ referralCode: code.toUpperCase() }, { projection: { _id: 0 } });
}
export async function updateCreator(id: string, patch: Partial<Creator>): Promise<void> {
  const db = await getDb();
  await db.collection<Creator>("creators").updateOne(
    { id }, { $set: { ...patch, updatedAt: new Date().toISOString() } },
  );
}
export async function incrementCreator(id: string, inc: Partial<Record<keyof Creator, number>>): Promise<void> {
  const db = await getDb();
  await db.collection<Creator>("creators").updateOne({ id }, { $inc: inc as Record<string, number> });
}
export async function listCreatorsByState(state?: CreatorApplicationState, limit = 200): Promise<Creator[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (state) q.state = state;
  return db.collection<Creator>("creators")
    .find(q, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 }).limit(limit).toArray();
}
export async function listLeaderboard(limit = 20): Promise<Creator[]> {
  const db = await getDb();
  return db.collection<Creator>("creators")
    .find({ state: "approved" }, { projection: { _id: 0 } })
    .sort({ lifetimePostsApproved: -1, lifetimeProductsEarned: -1 })
    .limit(limit).toArray();
}

export function tierFor(postsApproved: number): CreatorTier {
  if (postsApproved >= 100) return "Royal Legend";
  if (postsApproved >= 40) return "Kingdom Ambassador";
  if (postsApproved >= 10) return "Imperial Creator";
  return "Royal Creator";
}
