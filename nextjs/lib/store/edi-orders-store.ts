// EDI orders store. Each row is one inbound 850 Purchase Order from a
// retailer plus its lifecycle state (acknowledged, shipped, invoiced).
// Mongo collection `ediOrders`, file fallback `.data/edi-orders.json`.
//
// Seeded on first read with two sample POs so /admin/edi is a working
// dashboard before a real provider is wired up — remove the seed block
// once a provider is live.

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

/* -------------------------- Sample seed ---------------------------- */

function seedOrders(): EdiOrder[] {
  const now = new Date();
  const d = (daysAgo: number) =>
    new Date(now.getTime() - daysAgo * 24 * 3600 * 1000).toISOString();
  const lines1: EdiOrderLine[] = [
    {
      lineNumber: 1,
      sku: "SOK-COMPLETE-7IN1",
      upc: "860009234017",
      description: "Sphere of Kings · Complete 7-in-1",
      quantity: 144,
      unitPrice: 89.5,
      lineTotal: 144 * 89.5,
    },
    {
      lineNumber: 2,
      sku: "SOK-ROYAL-CHECKERS",
      upc: "860009234024",
      description: "Royal Checkers refill kit",
      quantity: 72,
      unitPrice: 39.5,
      lineTotal: 72 * 39.5,
    },
  ];
  const lines2: EdiOrderLine[] = [
    {
      lineNumber: 1,
      sku: "SOK-COMPLETE-7IN1",
      upc: "860009234017",
      description: "Sphere of Kings · Complete 7-in-1",
      quantity: 36,
      unitPrice: 92.0,
      lineTotal: 36 * 92.0,
    },
  ];
  return [
    {
      id: `edi_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
      poNumber: "SAMPLE-PO-77314",
      partnerId: "seed-target",
      partnerName: "Target (sample)",
      status: "received",
      currency: "USD",
      lines: lines1,
      subtotal: lines1.reduce((s, l) => s + l.lineTotal, 0),
      shipTo:
        "Target DC 3808\n1200 Interchange Blvd\nShafter, CA 93263\nUnited States",
      shipDateRequested: d(-14),
      cancelDate: d(-21),
      receivedISO: d(0),
      providerDocumentId: "mock_850_sample_77314",
    },
    {
      id: `edi_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
      poNumber: "SAMPLE-PO-77215",
      partnerId: "seed-indie",
      partnerName: "The Game Haven (sample)",
      status: "acknowledged",
      currency: "USD",
      lines: lines2,
      subtotal: lines2.reduce((s, l) => s + l.lineTotal, 0),
      shipTo:
        "The Game Haven\n418 Main Street\nColumbus, OH 43215\nUnited States",
      shipDateRequested: d(-7),
      receivedISO: d(2),
      acknowledgedISO: d(1),
      providerDocumentId: "mock_850_sample_77215",
    },
  ];
}

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(seedOrders(), null, 2), "utf8");
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
  // Seed Mongo on first use if empty.
  const n = await col.estimatedDocumentCount().catch(() => 0);
  if (n === 0) {
    await col.insertMany(seedOrders()).catch(() => {});
  }
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
