// Trading partners store. A trading partner is a retailer or
// distributor we exchange EDI with (Target, Walmart, Kroger, the
// hypothetical boutique chain that found us on RangeMe, etc.). Mongo
// collection `tradingPartners`, file fallback `.data/trading-partners.json`.

import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import type { TradingPartner, EdiTransport } from "@/lib/edi/types";

const COLLECTION = "tradingPartners";
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "trading-partners.json");

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<TradingPartner[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(records: TradingPartner[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(records, null, 2), "utf8");
}

let indexEnsured = false;
async function ensureMongoIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<TradingPartner>(COLLECTION);
  await col.createIndex({ id: 1 }, { unique: true }).catch(() => {
    indexEnsured = false;
  });
}

export async function listTradingPartners(): Promise<TradingPartner[]> {
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<TradingPartner>(COLLECTION);
    return col.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
  }
  const records = await fileReadAll();
  return records.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export async function findTradingPartner(
  id: string,
): Promise<TradingPartner | undefined> {
  if (hasMongo()) {
    const col = await getCollection<TradingPartner>(COLLECTION);
    const doc = await col.findOne({ id }, { projection: { _id: 0 } });
    return doc ?? undefined;
  }
  const records = await fileReadAll();
  return records.find((r) => r.id === id);
}

export type CreateTradingPartnerInput = {
  name: string;
  providerPartnerId?: string;
  transport: EdiTransport;
  gln?: string;
  warehouseLocation?: string;
  defaultCurrency?: string;
  defaultIncoterm?: string;
  notes?: string;
};

export async function createTradingPartner(
  input: CreateTradingPartnerInput,
): Promise<TradingPartner> {
  const now = new Date().toISOString();
  const record: TradingPartner = {
    id: `tp_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    name: input.name.trim(),
    providerPartnerId: input.providerPartnerId?.trim() || undefined,
    transport: input.transport,
    gln: input.gln?.trim() || undefined,
    warehouseLocation: input.warehouseLocation?.trim() || undefined,
    defaultCurrency: input.defaultCurrency?.trim() || "USD",
    defaultIncoterm: input.defaultIncoterm?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    active: true,
    createdISO: now,
    updatedISO: now,
  };

  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<TradingPartner>(COLLECTION);
    await col.insertOne(record);
    return record;
  }
  const records = await fileReadAll();
  records.push(record);
  await fileWriteAll(records);
  return record;
}

export type UpdateTradingPartnerInput = Partial<CreateTradingPartnerInput> & {
  active?: boolean;
};

export async function updateTradingPartner(
  id: string,
  patch: UpdateTradingPartnerInput,
): Promise<TradingPartner | undefined> {
  const now = new Date().toISOString();
  const applyPatch = (prev: TradingPartner): TradingPartner => ({
    ...prev,
    name: patch.name !== undefined ? patch.name.trim() : prev.name,
    providerPartnerId:
      patch.providerPartnerId !== undefined
        ? patch.providerPartnerId.trim() || undefined
        : prev.providerPartnerId,
    transport: patch.transport ?? prev.transport,
    gln: patch.gln !== undefined ? patch.gln.trim() || undefined : prev.gln,
    warehouseLocation:
      patch.warehouseLocation !== undefined
        ? patch.warehouseLocation.trim() || undefined
        : prev.warehouseLocation,
    defaultCurrency: patch.defaultCurrency ?? prev.defaultCurrency,
    defaultIncoterm:
      patch.defaultIncoterm !== undefined
        ? patch.defaultIncoterm.trim() || undefined
        : prev.defaultIncoterm,
    notes:
      patch.notes !== undefined ? patch.notes.trim() || undefined : prev.notes,
    active: patch.active !== undefined ? patch.active : prev.active,
    updatedISO: now,
  });

  if (hasMongo()) {
    const col = await getCollection<TradingPartner>(COLLECTION);
    const existing = await col.findOne({ id }, { projection: { _id: 0 } });
    if (!existing) return undefined;
    const next = applyPatch(existing);
    await col.updateOne({ id }, { $set: next });
    return next;
  }
  const records = await fileReadAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  records[idx] = applyPatch(records[idx]);
  await fileWriteAll(records);
  return records[idx];
}

export async function deleteTradingPartner(id: string): Promise<boolean> {
  if (hasMongo()) {
    const col = await getCollection<TradingPartner>(COLLECTION);
    const r = await col.deleteOne({ id });
    return r.deletedCount > 0;
  }
  const records = await fileReadAll();
  const before = records.length;
  const remaining = records.filter((r) => r.id !== id);
  if (remaining.length === before) return false;
  await fileWriteAll(remaining);
  return true;
}
