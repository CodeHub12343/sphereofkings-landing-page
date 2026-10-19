import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
export { DESIGN_COLS, DESIGN_ROWS, emptyGrid, validateGrid } from "@/lib/sphere-grid";

// Sphere designs are stored as a flat grid of color tokens, suitable
// both for 2D rendering and for mapping onto the 14×8 cylinder in 3D.
// The canonical representation is `grid[row][col]` with the same
// (col, row) coordinate system the game engines use.

export interface SphereDesign {
  _id?: ObjectId;
  id: string;             // uuid
  playerId: string;
  title: string;
  // Row-major 14×8 grid of hex strings. "" or null = unset (shows the
  // default dark board colour from the palette).
  grid: string[][];
  // Optional PNG preview rendered client-side. Stored as either an
  // embedded data URL (small designs) or a Vercel Blob key when the
  // size trips the embed threshold. See /api/sphere-designs/upload.
  previewDataUrl?: string;
  previewBlobKey?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function ensureSphereDesignIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<SphereDesign>("sphereDesigns").createIndex({ id: 1 }, { unique: true }),
    db.collection<SphereDesign>("sphereDesigns").createIndex({ playerId: 1, updatedAt: -1 }),
    db.collection<SphereDesign>("sphereDesigns").createIndex({ isPublic: 1, updatedAt: -1 }),
  ]);
}

export async function createDesign(d: SphereDesign): Promise<void> {
  const db = await getDb();
  await db.collection<SphereDesign>("sphereDesigns").insertOne(d);
}

export async function getDesign(id: string): Promise<SphereDesign | null> {
  const db = await getDb();
  return db.collection<SphereDesign>("sphereDesigns").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateDesign(id: string, patch: Partial<SphereDesign>): Promise<void> {
  const db = await getDb();
  await db.collection<SphereDesign>("sphereDesigns").updateOne({ id }, { $set: patch });
}

export async function listDesignsFor(playerId: string): Promise<SphereDesign[]> {
  const db = await getDb();
  return db.collection<SphereDesign>("sphereDesigns")
    .find({ playerId }, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 }).limit(50).toArray();
}

