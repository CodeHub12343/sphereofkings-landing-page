// Subscribers store. Mongo-first with a file fallback for dev. See the
// commentary at the top of quotes-store.ts — same pattern. Collection:
// `subscribers`, keyed by lowercased email.

import { promises as fs } from "node:fs";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import { newToken } from "@/lib/subscriber-tokens";

const DATA_DIR = path.join(process.cwd(), ".data");
const SUBSCRIBERS_PATH = path.join(DATA_DIR, "subscribers.json");
const COLLECTION = "subscribers";

export type SubscriberStatus =
  | "pending-confirm"
  | "consented"
  | "unsubscribed";
export type SubscriberSource = "landing" | "contact" | "import" | "donate";

export type StoredSubscriber = {
  email: string;
  firstName?: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  createdISO: string;
  confirmedISO?: string;
  unsubscribedISO?: string;
  confirmToken: string;
  unsubscribeToken: string;
  lastConfirmSentISO?: string;
};

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SUBSCRIBERS_PATH);
  } catch {
    await fs.writeFile(SUBSCRIBERS_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<StoredSubscriber[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(SUBSCRIBERS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(records: StoredSubscriber[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(
    SUBSCRIBERS_PATH,
    JSON.stringify(records, null, 2),
    "utf8",
  );
}

/* -------------------------- Mongo helpers -------------------------- */

let indexEnsured = false;
async function ensureMongoIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<StoredSubscriber>(COLLECTION);
  // Email is the primary key for subscribers. Unique index prevents
  // double-signups.
  await col.createIndex({ email: 1 }, { unique: true }).catch(() => {
    // non-fatal — a dup-key already-exists error is fine
    indexEnsured = false;
  });
}

/* -------------------------- Public API ----------------------------- */

export async function listSubscribers(): Promise<StoredSubscriber[]> {
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ createdISO: -1 })
      .toArray();
  }
  const records = await fileReadAll();
  return records.slice().sort((a, b) => (a.createdISO < b.createdISO ? 1 : -1));
}

export async function findByEmail(
  email: string,
): Promise<StoredSubscriber | undefined> {
  const key = email.trim().toLowerCase();
  if (!key) return undefined;
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const doc = await col.findOne({ email: key }, { projection: { _id: 0 } });
    return doc ?? undefined;
  }
  const records = await fileReadAll();
  return records.find((r) => r.email === key);
}

export async function findByToken(
  kind: "confirm" | "unsubscribe",
  token: string,
): Promise<StoredSubscriber | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const field = kind === "confirm" ? "confirmToken" : "unsubscribeToken";
    const doc = await col.findOne(
      { [field]: token },
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const records = await fileReadAll();
  return records.find((r) =>
    kind === "confirm"
      ? r.confirmToken === token
      : r.unsubscribeToken === token,
  );
}

export async function countConsented(): Promise<number> {
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    return col.countDocuments({ status: "consented" });
  }
  const records = await fileReadAll();
  return records.filter((r) => r.status === "consented").length;
}

export type UpsertResult =
  | { kind: "created"; record: StoredSubscriber }
  | { kind: "resent"; record: StoredSubscriber }
  | { kind: "already-consented"; record: StoredSubscriber }
  | { kind: "unsubscribed"; record: StoredSubscriber };

export async function upsertPending(input: {
  email: string;
  firstName?: string;
  source: SubscriberSource;
}): Promise<UpsertResult> {
  const key = input.email.trim().toLowerCase();
  if (!key) throw new Error("email required");
  const now = new Date().toISOString();

  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const existing = await col.findOne(
      { email: key },
      { projection: { _id: 0 } },
    );
    if (existing) {
      if (existing.status === "consented") {
        return { kind: "already-consented", record: existing };
      }
      if (existing.status === "unsubscribed") {
        return { kind: "unsubscribed", record: existing };
      }
      // pending-confirm: bump sent, keep tokens stable.
      const bumped: StoredSubscriber = {
        ...existing,
        firstName: input.firstName ?? existing.firstName,
        lastConfirmSentISO: now,
      };
      await col.updateOne(
        { email: key },
        {
          $set: {
            firstName: bumped.firstName,
            lastConfirmSentISO: now,
          },
        },
      );
      return { kind: "resent", record: bumped };
    }
    const record: StoredSubscriber = {
      email: key,
      firstName: input.firstName?.trim() || undefined,
      status: "pending-confirm",
      source: input.source,
      createdISO: now,
      confirmToken: newToken(),
      unsubscribeToken: newToken(),
      lastConfirmSentISO: now,
    };
    await col.insertOne(record);
    return { kind: "created", record };
  }

  // File fallback
  const records = await fileReadAll();
  const idx = records.findIndex((r) => r.email === key);
  if (idx !== -1) {
    const existing = records[idx];
    if (existing.status === "consented") {
      return { kind: "already-consented", record: existing };
    }
    if (existing.status === "unsubscribed") {
      return { kind: "unsubscribed", record: existing };
    }
    const bumped: StoredSubscriber = {
      ...existing,
      firstName: input.firstName ?? existing.firstName,
      lastConfirmSentISO: now,
    };
    records[idx] = bumped;
    await fileWriteAll(records);
    return { kind: "resent", record: bumped };
  }
  const record: StoredSubscriber = {
    email: key,
    firstName: input.firstName?.trim() || undefined,
    status: "pending-confirm",
    source: input.source,
    createdISO: now,
    confirmToken: newToken(),
    unsubscribeToken: newToken(),
    lastConfirmSentISO: now,
  };
  records.push(record);
  await fileWriteAll(records);
  return { kind: "created", record };
}

export async function markConsented(
  token: string,
): Promise<StoredSubscriber | undefined> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const existing = await col.findOne(
      { confirmToken: token },
      { projection: { _id: 0 } },
    );
    if (!existing) return undefined;
    if (existing.status === "consented") return existing;
    await col.updateOne(
      { confirmToken: token },
      { $set: { status: "consented", confirmedISO: now } },
    );
    return { ...existing, status: "consented", confirmedISO: now };
  }
  const records = await fileReadAll();
  const i = records.findIndex((r) => r.confirmToken === token);
  if (i === -1) return;
  if (records[i].status === "consented") return records[i];
  records[i] = { ...records[i], status: "consented", confirmedISO: now };
  await fileWriteAll(records);
  return records[i];
}

export async function markUnsubscribed(
  token: string,
): Promise<StoredSubscriber | undefined> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const existing = await col.findOne(
      { unsubscribeToken: token },
      { projection: { _id: 0 } },
    );
    if (!existing) return undefined;
    if (existing.status === "unsubscribed") return existing;
    await col.updateOne(
      { unsubscribeToken: token },
      { $set: { status: "unsubscribed", unsubscribedISO: now } },
    );
    return {
      ...existing,
      status: "unsubscribed",
      unsubscribedISO: now,
    };
  }
  const records = await fileReadAll();
  const i = records.findIndex((r) => r.unsubscribeToken === token);
  if (i === -1) return;
  if (records[i].status === "unsubscribed") return records[i];
  records[i] = {
    ...records[i],
    status: "unsubscribed",
    unsubscribedISO: now,
  };
  await fileWriteAll(records);
  return records[i];
}

export async function bumpConfirmSent(
  email: string,
): Promise<StoredSubscriber | undefined> {
  const key = email.trim().toLowerCase();
  const now = new Date().toISOString();
  if (hasMongo()) {
    const col = await getCollection<StoredSubscriber>(COLLECTION);
    const existing = await col.findOne({ email: key }, { projection: { _id: 0 } });
    if (!existing) return undefined;
    if (existing.status !== "pending-confirm") return existing;
    await col.updateOne({ email: key }, { $set: { lastConfirmSentISO: now } });
    return { ...existing, lastConfirmSentISO: now };
  }
  const records = await fileReadAll();
  const i = records.findIndex((r) => r.email === key);
  if (i === -1) return;
  if (records[i].status !== "pending-confirm") return records[i];
  records[i] = { ...records[i], lastConfirmSentISO: now };
  await fileWriteAll(records);
  return records[i];
}
