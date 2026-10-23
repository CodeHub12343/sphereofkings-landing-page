// Withdrawal requests — one row per affiliate payout request.
//
// Lifecycle:
//   pending   → affiliate created the request; admin needs to review.
//   approved  → admin OK'd it but hasn't moved the money yet. Orders
//               tied to the request stay LOCKED so the affiliate can't
//               re-request them.
//   completed → admin wired/sent the money; locked orders flip to
//               paid-out; statement email sent.
//   rejected  → admin declined (with reason). Orders unlock back to
//               the affiliate's available balance.
//
// The money NEVER moves through this app — these states just track the
// paper trail. The actual bank transfer / PayPal send happens
// out-of-band and the admin marks completion when it's done.

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Filter } from "mongodb";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import type { PayoutMethodKind } from "@/lib/sample-affiliates";

export type WithdrawalRequestStatus =
  | "pending"
  | "approved"
  | "completed"
  | "rejected";

export type StoredWithdrawalRequest = {
  id: string;                   // uuid
  affiliateCode: string;
  status: WithdrawalRequestStatus;
  // Snapshot of totals + method at request time. Protects against the
  // affiliate changing their payout details between request and payout.
  amountMinor: number;
  payoutMethod: PayoutMethodKind;
  payoutDetails: string;        // snapshot — admin pays this exact string
  // Order refs this request covers. Those attributed-orders have their
  // `withdrawalRequestId` set so the available-balance query excludes
  // them. On rejection the lock is released; on completion the orders
  // flip to paid-out and the amountMinor becomes the "paid" line on
  // the statement.
  orderRefs: string[];
  requestedISO: string;
  // Admin decision bookkeeping — set in approved / completed /
  // rejected states.
  decisionAdminId?: string;
  decisionAdminLabel?: string;
  decisionISO?: string;
  completedISO?: string;
  completedReference?: string;  // bank transfer id / PayPal confirmation
  rejectReason?: string;
  // Free-form note the admin can add on approve/complete.
  adminNote?: string;
};

const COLLECTION = "withdrawal_requests";
const DATA_DIR = path.resolve(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "withdrawal-requests.json");

/* -------------------------- File backend --------------------------- */

async function fileReadAll(): Promise<StoredWithdrawalRequest[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(rows: StoredWithdrawalRequest[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

/* -------------------------- Mongo helpers -------------------------- */

let indexEnsured = false;
async function ensureIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
  await Promise.all([
    col.createIndex({ id: 1 }, { unique: true }).catch(() => { indexEnsured = false; }),
    col.createIndex({ affiliateCode: 1, status: 1 }).catch(() => {}),
    col.createIndex({ status: 1, requestedISO: -1 }).catch(() => {}),
  ]);
}

/* -------------------------- Public API ----------------------------- */

export async function listWithdrawalRequests(filter?: {
  status?: WithdrawalRequestStatus;
  affiliateCode?: string;
}): Promise<StoredWithdrawalRequest[]> {
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
    const q: Filter<StoredWithdrawalRequest> = {};
    if (filter?.status) q.status = filter.status;
    if (filter?.affiliateCode) q.affiliateCode = filter.affiliateCode;
    return col
      .find(q, { projection: { _id: 0 } })
      .sort({ requestedISO: -1 })
      .toArray();
  }
  const all = await fileReadAll();
  return all
    .filter((r) => !filter?.status || r.status === filter.status)
    .filter((r) => !filter?.affiliateCode || r.affiliateCode === filter.affiliateCode)
    .sort((a, b) => (a.requestedISO < b.requestedISO ? 1 : -1));
}

export async function findWithdrawalRequestById(
  id: string,
): Promise<StoredWithdrawalRequest | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
    const doc = await col.findOne({ id } as Filter<StoredWithdrawalRequest>, { projection: { _id: 0 } });
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  return all.find((r) => r.id === id);
}

export type NewWithdrawalRequestInput = {
  affiliateCode: string;
  amountMinor: number;
  payoutMethod: PayoutMethodKind;
  payoutDetails: string;
  orderRefs: string[];
};

export async function createWithdrawalRequest(
  input: NewWithdrawalRequestInput,
): Promise<StoredWithdrawalRequest> {
  const record: StoredWithdrawalRequest = {
    id: randomUUID(),
    affiliateCode: input.affiliateCode,
    status: "pending",
    amountMinor: input.amountMinor,
    payoutMethod: input.payoutMethod,
    payoutDetails: input.payoutDetails,
    orderRefs: input.orderRefs,
    requestedISO: new Date().toISOString(),
  };
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
    await col.insertOne({ ...record });
    return record;
  }
  const all = await fileReadAll();
  all.push(record);
  await fileWriteAll(all);
  return record;
}

export async function updateWithdrawalRequest(
  id: string,
  patch: Partial<StoredWithdrawalRequest>,
): Promise<StoredWithdrawalRequest | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { id } as Filter<StoredWithdrawalRequest>,
      { $set: patch },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((r) => r.id === id);
  if (i === -1) return undefined;
  all[i] = { ...all[i], ...patch };
  await fileWriteAll(all);
  return all[i];
}

export async function countPendingWithdrawalRequests(): Promise<number> {
  if (hasMongo()) {
    const col = await getCollection<StoredWithdrawalRequest>(COLLECTION);
    return col.countDocuments({ status: "pending" } as Filter<StoredWithdrawalRequest>);
  }
  const all = await fileReadAll();
  return all.filter((r) => r.status === "pending").length;
}
