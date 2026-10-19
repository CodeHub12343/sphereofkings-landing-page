import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// A "custom physical sphere" order lives in its own collection and
// also surfaces in admin fulfillment. The design snapshot is embedded
// (not a reference) so the manufacturer sees exactly what the player
// approved at order time, even if the player edits the design later.

export interface CustomSphereOrder {
  _id?: ObjectId;
  id: string;                   // uuid
  playerId: string;
  playerUsername: string;
  playerDisplayName: string;
  designId: string;
  designTitle: string;
  // Snapshot of the grid at order time.
  designGridSnapshot: string[][];
  designPreviewUrl?: string;
  // Shipping — a trimmed snapshot the manufacturer needs.
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
  shippingCountry: string;      // ISO 3166-1 alpha-2
  // Price in cents at order time; "custom" product in the catalogue.
  priceCents: number;
  currency: string;             // "usd"
  stripePaymentIntentId?: string;
  status:
    | "pending-payment"
    | "paid"
    | "in-production"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingCarrier?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function ensureCustomSphereOrderIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<CustomSphereOrder>("customSphereOrders").createIndex({ id: 1 }, { unique: true }),
    db.collection<CustomSphereOrder>("customSphereOrders").createIndex({ playerId: 1, createdAt: -1 }),
    db.collection<CustomSphereOrder>("customSphereOrders").createIndex({ status: 1, createdAt: -1 }),
  ]);
}

export async function insertCustomSphereOrder(row: CustomSphereOrder): Promise<void> {
  const db = await getDb();
  await db.collection<CustomSphereOrder>("customSphereOrders").insertOne(row);
}

export async function listCustomSphereOrders(filter?: { status?: CustomSphereOrder["status"] }): Promise<CustomSphereOrder[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (filter?.status) q.status = filter.status;
  return db.collection<CustomSphereOrder>("customSphereOrders")
    .find(q, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(200).toArray();
}

export async function getCustomSphereOrder(id: string): Promise<CustomSphereOrder | null> {
  const db = await getDb();
  return db.collection<CustomSphereOrder>("customSphereOrders").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateCustomSphereOrder(id: string, patch: Partial<CustomSphereOrder>): Promise<void> {
  const db = await getDb();
  await db.collection<CustomSphereOrder>("customSphereOrders").updateOne(
    { id }, { $set: { ...patch, updatedAt: new Date().toISOString() } },
  );
}
