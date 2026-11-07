import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// A "creation" is a full Creation Station design: grid + nine-color palette
// + per-category customization + personalization + attached assets. Unlike
// the simpler SphereDesign, a creation keeps an embedded version history so
// customers can undo / restore across sessions, and a derived status used by
// the production workflow.

export type CreationStatus =
  | "draft"            // player is editing
  | "ai-processing"    // background AI job running
  | "geometry-check"   // CAD validation running
  | "needs-review"     // human production reviewer required
  | "approved"         // ready to print
  | "printing"
  | "shipped"
  | "rejected";

export type CreationFinish = "matte" | "glossy" | "metallic" | "glow" | "translucent";

export interface CheckerConfig {
  topColor: string;
  bottomColor: string;
  crown: boolean;
  crownColor: string;
  symbol: string;
  engraving: string;
}

export interface Personalization {
  name: string;
  date: string;
  message: string;
  verse: string;
}

export interface CreationConfig {
  palette: string[];                 // 1..24 HEX colors
  finish: CreationFinish;
  checker: CheckerConfig;
  personal: Personalization;
  // Per-category overrides keyed by category id.
  categories: Record<string, {
    palette?: string[];
    assetId?: string;                // uploaded image / generated artwork
    text?: string;
    notes?: string;
  }>;
  // Protected-mechanism toggles (double-stack magnets etc).
  mechanics: {
    magneticStacking: boolean;
    reinforcedLid: boolean;
    internalStorage: boolean;
  };
  // Confirmations required before production.
  rightsConfirmed: boolean;
  // Bulk / gift metadata.
  quantity: number;
  giftMessage?: string;
  memorial?: boolean;
}

export interface CreationVersion {
  v: number;
  grid: string[][];
  config: CreationConfig;
  snapshotAt: string;
  reason?: "autosave" | "manual" | "ai-apply" | "import";
}

export interface Creation {
  _id?: ObjectId;
  id: string;
  playerId: string;
  playerUsername: string;
  title: string;
  grid: string[][];                  // current grid
  config: CreationConfig;            // current config
  versions: CreationVersion[];       // history (bounded)
  previewDataUrl?: string;
  previewBlobKey?: string;
  // Derived state
  status: CreationStatus;
  feasibilityScore?: number;
  feasibilityNotes?: string[];
  // Marketplace
  isPublic: boolean;
  publishedAt?: string;
  marketplaceVotes: number;
  marketplaceDownloads: number;
  // Royalty basis points the creator earns on marketplace orders of this
  // creation. Default 1000 (10%). Capped per site policy in the API.
  royaltyBps: number;
  // Pricing cache
  estimatedPriceCents?: number;
  estimatedPrintMinutes?: number;
  // Moderation
  ipFlags?: string[];
  moderationState: "clear" | "flagged" | "blocked";
  // Tracking
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const MAX_VERSIONS = 50;

export async function ensureCreationIndexes(): Promise<void> {
  const db = await getDb();
  const c = db.collection<Creation>("creations");
  await Promise.all([
    c.createIndex({ id: 1 }, { unique: true }),
    c.createIndex({ playerId: 1, updatedAt: -1 }),
    c.createIndex({ isPublic: 1, marketplaceVotes: -1 }),
    c.createIndex({ status: 1, updatedAt: -1 }),
    c.createIndex({ tags: 1 }),
  ]);
}

export async function insertCreation(row: Creation): Promise<void> {
  const db = await getDb();
  await db.collection<Creation>("creations").insertOne(row);
}

export async function getCreation(id: string): Promise<Creation | null> {
  const db = await getDb();
  return db.collection<Creation>("creations").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateCreation(id: string, patch: Partial<Creation>): Promise<void> {
  const db = await getDb();
  await db.collection<Creation>("creations").updateOne({ id }, { $set: { ...patch, updatedAt: new Date().toISOString() } });
}

export async function pushVersion(id: string, version: CreationVersion): Promise<void> {
  const db = await getDb();
  await db.collection<Creation>("creations").updateOne(
    { id },
    {
      $push: { versions: { $each: [version], $slice: -MAX_VERSIONS } },
      $set: { updatedAt: new Date().toISOString() },
    },
  );
}

export async function listCreationsFor(playerId: string, limit = 50): Promise<Creation[]> {
  const db = await getDb();
  return db.collection<Creation>("creations")
    .find({ playerId }, { projection: { _id: 0, versions: 0 } })
    .sort({ updatedAt: -1 }).limit(limit).toArray();
}

export async function listMarketplace(limit = 60, tag?: string): Promise<Creation[]> {
  const db = await getDb();
  const q: Record<string, unknown> = { isPublic: true, moderationState: "clear" };
  if (tag) q.tags = tag;
  return db.collection<Creation>("creations")
    .find(q, { projection: { _id: 0, versions: 0, config: 0 } })
    .sort({ marketplaceVotes: -1, publishedAt: -1 }).limit(limit).toArray();
}

export async function listByStatus(status: CreationStatus, limit = 100): Promise<Creation[]> {
  const db = await getDb();
  return db.collection<Creation>("creations")
    .find({ status }, { projection: { _id: 0, versions: 0 } })
    .sort({ updatedAt: -1 }).limit(limit).toArray();
}

export async function incrementVote(id: string, delta: number): Promise<void> {
  const db = await getDb();
  await db.collection<Creation>("creations").updateOne({ id }, { $inc: { marketplaceVotes: delta } });
}

export async function deleteCreation(id: string, playerId: string): Promise<boolean> {
  const db = await getDb();
  const res = await db.collection<Creation>("creations").deleteOne({ id, playerId });
  return (res.deletedCount ?? 0) > 0;
}

export function defaultConfig(): CreationConfig {
  return {
    palette: ["#D4AF37", "#191919", "#FFFFFF", "#D32F2F", "#1565C0", "#2E7D32", "#8E24AA", "#FF8F00", "#00ACC1"],
    finish: "matte",
    checker: {
      topColor: "#D4AF37", bottomColor: "#191919",
      crown: true, crownColor: "#D4AF37",
      symbol: "", engraving: "",
    },
    personal: { name: "", date: "", message: "", verse: "" },
    categories: {},
    mechanics: { magneticStacking: true, reinforcedLid: true, internalStorage: true },
    rightsConfirmed: false,
    quantity: 1,
  };
}
