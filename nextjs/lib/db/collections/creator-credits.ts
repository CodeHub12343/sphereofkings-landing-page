import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// Non-cash Creator Credits ledger. Credits are earned on assignment
// completion and spent on reward redemptions. Every mutation goes
// through this ledger — the Creator.creditsBalance field is a cheap
// mirror, authoritative state is the sum of entries.
//
// Critical invariants (enforced in the earn / redeem helpers):
//  1. Credits are issued at most once per assignmentId.
//  2. Redemption requires reserved inventory; a failed redemption
//     refunds the hold via a negative-sign entry with reason "refund".
//  3. Ledger entries are append-only. Reversals produce a new entry.

export type CreditEntryKind =
  | "earn"              // positive, from a completed assignment
  | "redeem"            // negative, from a reward redemption
  | "refund"            // positive, reversing a failed redemption
  | "admin-adjust";     // either sign, with reason in `note`

export interface CreditEntry {
  _id?: ObjectId;
  id: string;
  creatorId: string;
  kind: CreditEntryKind;
  delta: number;                // signed; sum across all entries = balance
  balanceAfter: number;         // convenience for UI; authoritative = sum
  // Dedup keys — kind-dependent. We use a compound unique index so the
  // same (creatorId, kind, idempotencyKey) can only be inserted once.
  idempotencyKey: string;
  // Context
  assignmentId?: string;
  redemptionId?: string;
  note?: string;
  adminId?: string;
  createdAt: string;
}

export interface Redemption {
  _id?: ObjectId;
  id: string;
  creatorId: string;
  productSku: string;
  productLabel: string;
  creditsSpent: number;
  shippingAddress?: {
    name: string; line1: string; line2?: string;
    city: string; region: string; postalCode: string; country: string;
  };
  status: "reserved" | "fulfilling" | "shipped" | "delivered" | "cancelled";
  trackingCarrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export async function ensureCreditIndexes(): Promise<void> {
  const db = await getDb();
  const l = db.collection<CreditEntry>("creatorCredits");
  const r = db.collection<Redemption>("creatorRedemptions");
  await Promise.all([
    l.createIndex({ id: 1 }, { unique: true }),
    l.createIndex({ creatorId: 1, createdAt: -1 }),
    l.createIndex({ creatorId: 1, kind: 1, idempotencyKey: 1 }, { unique: true }),
    l.createIndex({ assignmentId: 1 }),
    r.createIndex({ id: 1 }, { unique: true }),
    r.createIndex({ creatorId: 1, createdAt: -1 }),
    r.createIndex({ status: 1, createdAt: -1 }),
  ]);
}

export async function recordEntry(entry: CreditEntry): Promise<"ok" | "duplicate"> {
  const db = await getDb();
  try {
    await db.collection<CreditEntry>("creatorCredits").insertOne(entry);
    return "ok";
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      return "duplicate";
    }
    throw err;
  }
}

export async function listEntriesFor(creatorId: string, limit = 100): Promise<CreditEntry[]> {
  const db = await getDb();
  return db.collection<CreditEntry>("creatorCredits")
    .find({ creatorId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function sumBalance(creatorId: string): Promise<number> {
  const db = await getDb();
  const rows = await db.collection<CreditEntry>("creatorCredits")
    .find({ creatorId }, { projection: { delta: 1, _id: 0 } }).toArray();
  return rows.reduce((s, r) => s + r.delta, 0);
}

export async function insertRedemption(r: Redemption): Promise<void> {
  const db = await getDb();
  await db.collection<Redemption>("creatorRedemptions").insertOne(r);
}
export async function getRedemption(id: string): Promise<Redemption | null> {
  const db = await getDb();
  return db.collection<Redemption>("creatorRedemptions").findOne({ id }, { projection: { _id: 0 } });
}
export async function listRedemptionsFor(creatorId: string): Promise<Redemption[]> {
  const db = await getDb();
  return db.collection<Redemption>("creatorRedemptions")
    .find({ creatorId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(100).toArray();
}
export async function listAllRedemptions(): Promise<Redemption[]> {
  const db = await getDb();
  return db.collection<Redemption>("creatorRedemptions")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(500).toArray();
}
export async function updateRedemption(id: string, patch: Partial<Redemption>): Promise<void> {
  const db = await getDb();
  await db.collection<Redemption>("creatorRedemptions").updateOne(
    { id }, { $set: { ...patch, updatedAt: new Date().toISOString() } },
  );
}

// The reward catalog — kept here so it's trivially editable without a new
// collection. Admins can override credit prices from the admin UI by
// patching this at runtime (future: move to products collection).
export interface RewardProduct {
  sku: string;
  label: string;
  credits: number;
  category: "set" | "puzzle" | "custom" | "bundle";
  inventory: number;
  internationalEligible: boolean;
}

export const REWARD_CATALOG: RewardProduct[] = [
  { sku: "standard-set",    label: "Standard Sphere of Kings game set", credits: 500,  category: "set",    inventory: 500, internationalEligible: true },
  { sku: "additional-set",  label: "Additional game set",               credits: 500,  category: "set",    inventory: 500, internationalEligible: true },
  { sku: "puzzle",          label: "Puzzle edition",                    credits: 400,  category: "puzzle", inventory: 300, internationalEligible: true },
  { sku: "custom-puzzle",   label: "Custom-upload puzzle edition",      credits: 650,  category: "custom", inventory: 200, internationalEligible: true },
  { sku: "two-bundle",      label: "Two-game bundle",                   credits: 950,  category: "bundle", inventory: 150, internationalEligible: true },
  { sku: "three-bundle",    label: "Three-game bundle",                 credits: 1400, category: "bundle", inventory: 100, internationalEligible: false },
  { sku: "collector",       label: "Premium collector bundle",          credits: 2000, category: "bundle", inventory: 50,  internationalEligible: false },
];
