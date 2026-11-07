import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { CreationConfig } from "./creation-designs";

export type CreationOrderStatus =
  | "pending-payment"
  | "paid"
  | "queued"
  | "printing"
  | "qa"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface CreationOrderLine {
  label: string;             // "Sphere board", "Double-stack checker set", "Imperial Kings"
  quantity: number;
  unitCents: number;
  printMinutes: number;
  material: string;
  colors: string[];
}

export interface CreationOrder {
  _id?: ObjectId;
  id: string;
  playerId: string;
  playerUsername: string;
  creationId: string;
  creationTitle: string;
  // Snapshot taken at order time so later edits don't change what we print.
  gridSnapshot: string[][];
  configSnapshot: CreationConfig;
  previewUrl?: string;
  // Breakdown
  lines: CreationOrderLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  royaltyCents: number;       // paid to the original creator (0 if self)
  royaltyPlayerId?: string;
  totalCents: number;
  currency: string;           // "usd"
  // Shipping
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
  shippingCountry: string;
  // Stripe
  stripePaymentIntentId?: string;
  // Status
  status: CreationOrderStatus;
  statusHistory: { at: string; status: CreationOrderStatus; note?: string }[];
  productionNotes?: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  // Bulk / gift
  giftMessage?: string;
  memorial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function ensureCreationOrderIndexes(): Promise<void> {
  const db = await getDb();
  const c = db.collection<CreationOrder>("creationOrders");
  await Promise.all([
    c.createIndex({ id: 1 }, { unique: true }),
    c.createIndex({ playerId: 1, createdAt: -1 }),
    c.createIndex({ status: 1, createdAt: -1 }),
    c.createIndex({ creationId: 1 }),
  ]);
}

export async function insertCreationOrder(row: CreationOrder): Promise<void> {
  const db = await getDb();
  await db.collection<CreationOrder>("creationOrders").insertOne(row);
}

export async function getCreationOrder(id: string): Promise<CreationOrder | null> {
  const db = await getDb();
  return db.collection<CreationOrder>("creationOrders").findOne({ id }, { projection: { _id: 0 } });
}

export async function listCreationOrdersFor(playerId: string): Promise<CreationOrder[]> {
  const db = await getDb();
  return db.collection<CreationOrder>("creationOrders")
    .find({ playerId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(100).toArray();
}

export async function listAllCreationOrders(status?: CreationOrderStatus): Promise<CreationOrder[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (status) q.status = status;
  return db.collection<CreationOrder>("creationOrders")
    .find(q, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(300).toArray();
}

export async function transitionCreationOrder(
  id: string, status: CreationOrderStatus, note?: string,
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection<CreationOrder>("creationOrders").updateOne(
    { id },
    {
      $set: { status, updatedAt: now },
      $push: { statusHistory: { at: now, status, note } },
    },
  );
}
