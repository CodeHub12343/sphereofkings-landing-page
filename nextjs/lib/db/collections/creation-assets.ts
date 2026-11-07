import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// Uploaded or AI-generated artwork referenced by a Creation. Keeps its own
// moderation state so flagged assets can be rejected without touching the
// design that references them.

export interface CreationAsset {
  _id?: ObjectId;
  id: string;
  playerId: string;
  kind: "upload" | "ai-image" | "palette-extraction";
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  dataUrl?: string;         // for small images
  blobKey?: string;         // for large
  dominantColors: string[]; // HEX, up to 9
  rightsStatement: string;  // what the user agreed to on upload
  moderation: {
    state: "pending" | "clear" | "flagged" | "blocked";
    flags: string[];
    reviewedBy?: string;
    reviewedAt?: string;
  };
  createdAt: string;
}

export async function ensureCreationAssetIndexes(): Promise<void> {
  const db = await getDb();
  const c = db.collection<CreationAsset>("creationAssets");
  await Promise.all([
    c.createIndex({ id: 1 }, { unique: true }),
    c.createIndex({ playerId: 1, createdAt: -1 }),
    c.createIndex({ "moderation.state": 1, createdAt: -1 }),
  ]);
}

export async function insertAsset(row: CreationAsset): Promise<void> {
  const db = await getDb();
  await db.collection<CreationAsset>("creationAssets").insertOne(row);
}

export async function getAsset(id: string): Promise<CreationAsset | null> {
  const db = await getDb();
  return db.collection<CreationAsset>("creationAssets").findOne({ id }, { projection: { _id: 0 } });
}

export async function listAssetsFor(playerId: string): Promise<CreationAsset[]> {
  const db = await getDb();
  return db.collection<CreationAsset>("creationAssets")
    .find({ playerId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(100).toArray();
}

export async function listFlaggedAssets(): Promise<CreationAsset[]> {
  const db = await getDb();
  return db.collection<CreationAsset>("creationAssets")
    .find({ "moderation.state": { $in: ["pending", "flagged"] } },
          { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(100).toArray();
}
