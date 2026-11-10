// EDI orders store. Each row is one inbound 850 Purchase Order from a
// retailer plus its lifecycle state (acknowledged, shipped, invoiced).
// Mongo collection `ediOrders`, file fallback `.data/edi-orders.json`.

import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import type {
  EdiOrder,
  EdiOrderLine,
  EdiOrderStatus,
} from "@/lib/edi/types";

const COLLECTION = "ediOrders";
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "edi-orders.json");

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<EdiOrder[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(records: EdiOrder[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(records, null, 2), "utf8");
}

/* -------------------------- Mongo helpers -------------------------- */

let indexEnsured = false;
async function ensureMongoIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<EdiOrder>(COLLECTION);
  await col.createIndex({ id: 1 }, { unique: true }).catch(() => {
    indexEnsured = false;
  });
  await col.createIndex({ poNumber: 1 }).catch(() => {});
}

/* -------------------------- Public API ----------------------------- */

export async function listEdiOrders(): Promise<EdiOrder[]> {
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<EdiOrder>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ receivedISO: -1 })
      .toArray();
  }
  const records = await fileReadAll();
  return records
    .slice()
    .sort((a, b) => (a.receivedISO < b.receivedISO ? 1 : -1));
}

export async function findEdiOrder(id: string): Promise<EdiOrder | undefined> {
  if (hasMongo()) {
    const col = await getCollection<EdiOrder>(COLLECTION);
    const doc = await col.findOne({ id }, { projection: { _id: 0 } });
    return doc ?? undefined;
  }
  const records = await fileReadAll();
  return records.find((r) => r.id === id);
}

export async function insertEdiOrder(input: Omit<EdiOrder, "id" | "receivedISO" | "status">): Promise<EdiOrder> {
  const record: EdiOrder = {
    id: `edi_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
    receivedISO: new Date().toISOString(),
    status: "received",
    ...input,
  };
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<EdiOrder>(COLLECTION);
    await col.insertOne(record);
    return record;
  }
  const records = await fileReadAll();
  records.push(record);
  await fileWriteAll(records);
  return record;
}

export async function updateEdiOrderStatus(
  id: string,
  patch: {
    status?: EdiOrderStatus;
    acknowledgedISO?: string;
    shippedISO?: string;
    invoicedISO?: string;
    closedISO?: string;
    trackingNumber?: string;
    carrier?: string;
    invoiceNumber?: string;
  },
): Promise<EdiOrder | undefined> {
  if (hasMongo()) {
    const col = await getCollection<EdiOrder>(COLLECTION);
    const existing = await col.findOne({ id }, { projection: { _id: 0 } });
    if (!existing) return undefined;
    const next = { ...existing, ...patch };
    await col.updateOne({ id }, { $set: patch });
    return next;
  }
  const records = await fileReadAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  records[idx] = { ...records[idx], ...patch };
  await fileWriteAll(records);
  return records[idx];
}

export async function countEdiOrdersByStatus(): Promise<
  Record<EdiOrderStatus, number>
> {
  const all = await listEdiOrders();
  const base: Record<EdiOrderStatus, number> = {
    received: 0,
    acknowledged: 0,
    "in-fulfillment": 0,
    shipped: 0,
    invoiced: 0,
    closed: 0,
    rejected: 0,
    cancelled: 0,
  };
  for (const o of all) base[o.status] = (base[o.status] ?? 0) + 1;
  return base;
}
