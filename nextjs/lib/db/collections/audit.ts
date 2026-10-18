// Audit log. Records who did what to which record and when. Writes
// never block the originating action — a failed audit write is logged
// to stderr and the main server action proceeds.
//
// Mongo-first, file fallback. Collection: `auditEvents`. File store:
// `.data/audit.json`. The log is append-only in intent; we don't expose
// a delete API from here.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getCollection, hasMongo } from "@/lib/db/mongo";

export type AuditActorKind = "admin-session" | "env-basic" | "system";

export type AuditActor = {
  kind: AuditActorKind;
  // Admin user id when kind === "admin-session". Env username when
  // kind === "env-basic". Absent for system events.
  id?: string;
  email?: string;
  role?: string;
};

export type AuditEvent = {
  id: string;
  timestampISO: string;
  actor: AuditActor;
  // Dot-separated action name. Examples:
  //   quote.decide, product.update, product.create, product.delete,
  //   finance.closeMonth, finance.reopenMonth
  action: string;
  target: {
    collection: string;
    id: string;
  };
  summary: string;
  details?: Record<string, unknown>;
};

const COLLECTION = "auditEvents";
const DATA_DIR = path.join(process.cwd(), ".data");
const AUDIT_PATH = path.join(DATA_DIR, "audit.json");

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(AUDIT_PATH);
  } catch {
    await fs.writeFile(AUDIT_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<AuditEvent[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(AUDIT_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileAppend(event: AuditEvent): Promise<void> {
  const all = await fileReadAll();
  all.push(event);
  await fs.writeFile(AUDIT_PATH, JSON.stringify(all, null, 2), "utf8");
}

/* -------------------------- Public API ----------------------------- */

export type RecordAuditInput = Omit<AuditEvent, "id" | "timestampISO">;

export async function recordAuditEvent(input: RecordAuditInput): Promise<void> {
  const event: AuditEvent = {
    id: randomUUID(),
    timestampISO: new Date().toISOString(),
    ...input,
  };
  try {
    if (hasMongo()) {
      const col = await getCollection<AuditEvent>(COLLECTION);
      await col.insertOne(event);
      return;
    }
    await fileAppend(event);
  } catch (err) {
    // Audit writes are advisory, not blocking. Log and move on so the
    // originating admin action can still complete.
    // eslint-disable-next-line no-console
    console.warn("[audit] failed to record", input.action, err);
  }
}

export async function listAuditEvents(options?: {
  limit?: number;
  action?: string; // exact match
  category?: "wholesale" | "product" | "finance";
}): Promise<AuditEvent[]> {
  const limit = Math.max(1, Math.min(500, options?.limit ?? 200));
  if (hasMongo()) {
    const col = await getCollection<AuditEvent>(COLLECTION);
    const filter: Record<string, unknown> = {};
    if (options?.action) filter.action = options.action;
    if (options?.category) {
      filter.action = { $regex: `^${options.category}\\.` };
    }
    return col
      .find(filter, { projection: { _id: 0 } })
      .sort({ timestampISO: -1 })
      .limit(limit)
      .toArray();
  }
  const all = await fileReadAll();
  const filtered = all.filter((e) => {
    if (options?.action) return e.action === options.action;
    if (options?.category) return e.action.startsWith(`${options.category}.`);
    return true;
  });
  return filtered
    .slice()
    .sort((a, b) => (a.timestampISO < b.timestampISO ? 1 : -1))
    .slice(0, limit);
}
