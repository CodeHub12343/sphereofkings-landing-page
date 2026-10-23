// Attributed orders. One record per (order × affiliate). Mongo-first
// with the usual file fallback at `.data/attributed-orders.json`.
//
// Each record carries the affiliate's tier % at the time of attribution
// so a later tier change doesn't retroactively adjust historical
// commissions. The commission amount is computed when the order moves
// to `eligible` (payment succeeded) and the order's totalMinor is
// known — otherwise it stays `undefined` and the dashboard shows "$—".

import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter } from "mongodb";
import { getCollection, hasMongo } from "@/lib/db/mongo";

export type AttributionStatus =
  | "pending" // order placed, payment not yet confirmed
  | "eligible" // paid, commission applies
  | "paid-out" // commission has been paid to the affiliate out-of-band
  | "refund-pending" // Stripe reported a refund; adjustment pending
  | "cancelled"; // payment failed or order voided before paying

export type PayoutMethod = "bank" | "wise" | "paypal" | "other";

export type StoredAttribution = {
  // One record per (orderRef, affiliateCode). An order can carry
  // multiple records when attribution is split (e.g. first-touch
  // and last-touch share credit 50/50). The uniqueness invariant is
  // the composite (orderRef, affiliateCode), not orderRef alone.
  orderRef: string;
  affiliateCode: string;
  placedISO: string;
  // Snapshot of the affiliate's commission rate at the time of
  // attribution. Historical commissions don't shift with later
  // tier promotions.
  commissionTierPct: number;
  // What fraction of the order's commission this record represents.
  // 100 for the common single-affiliate case; split orders use 50/50
  // (or whatever the operator configures). Defaults to 100 when
  // reading back a row written before this field existed.
  sharePct?: number;
  // Attribution model that produced this record. Informational, so the
  // audit log can tell apart "last-touch" vs "first-touch" credit on a
  // split order.
  touch?: "last" | "first" | "sole";
  unitCount: number;
  status: AttributionStatus;
  // Set when the order is confirmed paid AND its totalMinor is known.
  commissionAmountMinor?: number;
  // Stripe-side anchors for post-hoc audits.
  orderTotalMinor?: number;
  lastStatusISO?: string;
  // Payout bookkeeping — set together when an admin marks the row
  // `paid-out`. The method/reference/note are informational; no money
  // moves through this app.
  paidOutISO?: string;
  payoutMethod?: PayoutMethod;
  payoutReference?: string;
  payoutNote?: string;
  // Lock marker. When set, this attribution belongs to a withdrawal
  // request and is not available for a new request. Cleared when the
  // owning request is rejected; cleared implicitly when the owning
  // request is completed (status flips to paid-out at the same time).
  withdrawalRequestId?: string;
};

const COLLECTION = "attributedOrders";
const DATA_DIR = path.join(process.cwd(), ".data");
const ATTR_PATH = path.join(DATA_DIR, "attributed-orders.json");

/* ------------------------- File backend ---------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ATTR_PATH);
  } catch {
    await fs.writeFile(ATTR_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<StoredAttribution[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(ATTR_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(records: StoredAttribution[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(ATTR_PATH, JSON.stringify(records, null, 2), "utf8");
}

/* ------------------------- Mongo helpers --------------------------- */

let indexEnsured = false;
async function ensureIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<StoredAttribution>(COLLECTION);
  // Drop the pre-split unique index on orderRef alone, if it exists.
  // We now allow multiple rows per order (one per affiliate).
  await col.dropIndex("orderRef_1").catch(() => {});
  await col
    .createIndex(
      { orderRef: 1, affiliateCode: 1 },
      { unique: true, name: "orderRef_affiliate_unique" },
    )
    .catch(() => {
      indexEnsured = false;
    });
  await col.createIndex({ affiliateCode: 1 }).catch(() => {});
  await col.createIndex({ orderRef: 1 }).catch(() => {});
}

/* -------------------------- Public API ----------------------------- */

export async function listAttributions(): Promise<StoredAttribution[]> {
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredAttribution>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ placedISO: -1 })
      .toArray();
  }
  const all = await fileReadAll();
  return all.slice().sort((a, b) => (a.placedISO < b.placedISO ? 1 : -1));
}

export async function listAttributionsForAffiliate(
  code: string,
): Promise<StoredAttribution[]> {
  const key = code.toUpperCase();
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredAttribution>(COLLECTION);
    return col
      .find(
        { affiliateCode: key } as Filter<StoredAttribution>,
        { projection: { _id: 0 } },
      )
      .sort({ placedISO: -1 })
      .toArray();
  }
  const all = await fileReadAll();
  return all
    .filter((r) => r.affiliateCode === key)
    .slice()
    .sort((a, b) => (a.placedISO < b.placedISO ? 1 : -1));
}

export async function listAttributionsByOrderRef(
  orderRef: string,
): Promise<StoredAttribution[]> {
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredAttribution>(COLLECTION);
    return col
      .find(
        { orderRef } as Filter<StoredAttribution>,
        { projection: { _id: 0 } },
      )
      .toArray();
  }
  const all = await fileReadAll();
  return all.filter((r) => r.orderRef === orderRef);
}

export type CreateAttributionInput = {
  orderRef: string;
  affiliateCode: string;
  commissionTierPct: number;
  unitCount: number;
  sharePct?: number;
  touch?: "last" | "first" | "sole";
};

export async function createAttribution(
  input: CreateAttributionInput,
): Promise<StoredAttribution> {
  const now = new Date().toISOString();
  const record: StoredAttribution = {
    orderRef: input.orderRef,
    affiliateCode: input.affiliateCode.toUpperCase(),
    placedISO: now,
    commissionTierPct: input.commissionTierPct,
    sharePct: input.sharePct ?? 100,
    touch: input.touch ?? "sole",
    unitCount: input.unitCount,
    status: "pending",
    lastStatusISO: now,
  };
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredAttribution>(COLLECTION);
    // Unique on (orderRef, affiliateCode). Duplicate inserts for the
    // same pair are a no-op; split orders insert two rows with
    // different codes under the same orderRef.
    try {
      await col.insertOne(record);
    } catch {
      // ignore — pair already exists
    }
  } else {
    const all = await fileReadAll();
    const dup = all.some(
      (r) =>
        r.orderRef === record.orderRef &&
        r.affiliateCode === record.affiliateCode,
    );
    if (!dup) {
      all.push(record);
      await fileWriteAll(all);
    }
  }
  return record;
}

export async function updateOneAttribution(
  orderRef: string,
  affiliateCode: string,
  patch: Partial<
    Pick<
      StoredAttribution,
      | "status"
      | "commissionAmountMinor"
      | "orderTotalMinor"
      | "paidOutISO"
      | "payoutMethod"
      | "payoutReference"
      | "payoutNote"
    >
  >,
): Promise<StoredAttribution | undefined> {
  const now = new Date().toISOString();
  const code = affiliateCode.toUpperCase();
  if (hasMongo()) {
    const col = await getCollection<StoredAttribution>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { orderRef, affiliateCode: code } as Filter<StoredAttribution>,
      { $set: { ...patch, lastStatusISO: now } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex(
    (r) => r.orderRef === orderRef && r.affiliateCode === code,
  );
  if (i === -1) return;
  all[i] = { ...all[i], ...patch, lastStatusISO: now };
  await fileWriteAll(all);
  return all[i];
}

export async function updateAttributionStatus(
  orderRef: string,
  status: AttributionStatus,
  extras: Partial<
    Pick<
      StoredAttribution,
      | "commissionAmountMinor"
      | "orderTotalMinor"
      | "paidOutISO"
      | "payoutMethod"
      | "payoutReference"
      | "payoutNote"
    >
  > = {},
): Promise<StoredAttribution | undefined> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    const col = await getCollection<StoredAttribution>(COLLECTION);
    // On a split order there may be multiple rows for one orderRef.
    // We update them all so a "cancel on refund" or "paid-out" write
    // reaches every attributed affiliate.
    await col.updateMany(
      { orderRef } as Filter<StoredAttribution>,
      { $set: { status, lastStatusISO: now, ...extras } },
    );
    const doc = await col.findOne(
      { orderRef } as Filter<StoredAttribution>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  let any: StoredAttribution | undefined;
  for (let i = 0; i < all.length; i++) {
    if (all[i].orderRef !== orderRef) continue;
    all[i] = { ...all[i], status, lastStatusISO: now, ...extras };
    any = all[i];
  }
  if (any) await fileWriteAll(all);
  return any;
}

/* ------------------------- Aggregates ------------------------------ */

export type AffiliateAggregate = {
  code: string;
  eligibleOrders: number;
  pendingOrders: number;
  refundedOrders: number;
  paidOutOrders: number;
  eligibleUnits: number;
  // Sum of commission amounts (in minor units) still unpaid — i.e.
  // records whose status is "eligible" (not yet paid out).
  eligibleCommissionMinor: number;
  // Sum of commission amounts (in minor units) already paid out.
  paidOutCommissionMinor: number;
};

export async function aggregateByAffiliate(): Promise<
  Record<string, AffiliateAggregate>
> {
  const all = await listAttributions();
  const map: Record<string, AffiliateAggregate> = {};
  for (const r of all) {
    const agg =
      map[r.affiliateCode] ??
      {
        code: r.affiliateCode,
        eligibleOrders: 0,
        pendingOrders: 0,
        refundedOrders: 0,
        paidOutOrders: 0,
        eligibleUnits: 0,
        eligibleCommissionMinor: 0,
        paidOutCommissionMinor: 0,
      };
    if (r.status === "eligible") {
      // Count paid orders as "eligible" for the tier ladder — these
      // are still real completed sales. The display column below is
      // the unpaid balance only.
      agg.eligibleOrders += 1;
      agg.eligibleUnits += r.unitCount;
      agg.eligibleCommissionMinor += r.commissionAmountMinor ?? 0;
    } else if (r.status === "paid-out") {
      // Paid-out rows still count toward the tier ladder (an affiliate
      // doesn't lose their Gold status after they get paid).
      agg.eligibleOrders += 1;
      agg.eligibleUnits += r.unitCount;
      agg.paidOutOrders += 1;
      agg.paidOutCommissionMinor += r.commissionAmountMinor ?? 0;
    } else if (r.status === "pending") {
      agg.pendingOrders += 1;
    } else if (r.status === "refund-pending") {
      agg.refundedOrders += 1;
    }
    map[r.affiliateCode] = agg;
  }
  return map;
}

/**
 * Mark every "eligible" attribution row for an affiliate as paid-out.
 * Returns the orderRefs that were flipped and the sum of their
 * commissions (in minor units) so the caller can show the operator
 * exactly what they just confirmed.
 */
export async function markAllEligiblePaidOut(
  affiliateCode: string,
  payout: {
    method: PayoutMethod;
    reference?: string;
    note?: string;
  },
): Promise<{ orderRefs: string[]; totalPaidMinor: number }> {
  const code = affiliateCode.toUpperCase();
  const now = new Date().toISOString();
  const rows = await listAttributionsForAffiliate(code);
  const eligible = rows.filter((r) => r.status === "eligible");
  if (eligible.length === 0) {
    return { orderRefs: [], totalPaidMinor: 0 };
  }
  let totalPaidMinor = 0;
  for (const r of eligible) {
    totalPaidMinor += r.commissionAmountMinor ?? 0;
    await updateAttributionStatus(r.orderRef, "paid-out", {
      paidOutISO: now,
      payoutMethod: payout.method,
      payoutReference: payout.reference,
      payoutNote: payout.note,
    });
  }
  return {
    orderRefs: eligible.map((r) => r.orderRef),
    totalPaidMinor,
  };
}

/**
 * Compute the commission amount in minor units for a given total +
 * tier %. Rounded to the nearest cent so dashboards never show
 * fractional pennies.
 */
export function computeCommissionMinor(
  orderTotalMinor: number,
  tierPct: number,
  sharePct = 100,
): number {
  return Math.round((orderTotalMinor * tierPct * sharePct) / 10000);
}

/* ------------------- Withdrawal-request integration ---------------- */

/**
 * Eligible-and-unlocked rows for an affiliate — the ones that count
 * toward their "available for withdrawal" balance. An eligible row
 * locked to an outstanding withdrawal request is excluded.
 */
export async function listAvailableForWithdrawal(
  affiliateCode: string,
): Promise<StoredAttribution[]> {
  const rows = await listAttributionsForAffiliate(affiliateCode);
  return rows.filter((r) => r.status === "eligible" && !r.withdrawalRequestId);
}

/**
 * Stamp a batch of (orderRef, affiliateCode) rows with the request id
 * so the available-balance query excludes them.
 */
export async function lockAttributionsForRequest(
  affiliateCode: string,
  orderRefs: string[],
  withdrawalRequestId: string,
): Promise<number> {
  if (orderRefs.length === 0) return 0;
  if (hasMongo()) {
    await ensureIndex();
    const col = await getCollection<StoredAttribution>(COLLECTION);
    const res = await col.updateMany(
      { affiliateCode, orderRef: { $in: orderRefs } } as Filter<StoredAttribution>,
      { $set: { withdrawalRequestId } },
    );
    return res.modifiedCount;
  }
  const all = await fileReadAll();
  let n = 0;
  for (const r of all) {
    if (r.affiliateCode === affiliateCode && orderRefs.includes(r.orderRef)) {
      r.withdrawalRequestId = withdrawalRequestId;
      n++;
    }
  }
  await fileWriteAll(all);
  return n;
}

/**
 * Release every attribution locked to a withdrawal request (on reject).
 */
export async function unlockAttributionsFromRequest(
  withdrawalRequestId: string,
): Promise<number> {
  if (hasMongo()) {
    const col = await getCollection<StoredAttribution>(COLLECTION);
    const res = await col.updateMany(
      { withdrawalRequestId } as Filter<StoredAttribution>,
      { $unset: { withdrawalRequestId: "" } },
    );
    return res.modifiedCount;
  }
  const all = await fileReadAll();
  let n = 0;
  for (const r of all) {
    if (r.withdrawalRequestId === withdrawalRequestId) {
      delete r.withdrawalRequestId;
      n++;
    }
  }
  await fileWriteAll(all);
  return n;
}

/**
 * Flip every attribution locked to a request from `eligible` to
 * `paid-out` and record the payout bookkeeping. Returns the orderRefs
 * flipped and the total commission paid.
 */
export async function markAttributionsPaidOutForRequest(
  withdrawalRequestId: string,
  payout: {
    method: PayoutMethod;
    reference?: string;
    note?: string;
  },
): Promise<{ orderRefs: string[]; totalPaidMinor: number }> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    const col = await getCollection<StoredAttribution>(COLLECTION);
    const rows = await col
      .find({ withdrawalRequestId } as Filter<StoredAttribution>, { projection: { _id: 0 } })
      .toArray();
    const orderRefs = rows.map((r) => r.orderRef);
    const totalPaidMinor = rows.reduce((n, r) => n + (r.commissionAmountMinor ?? 0), 0);
    await col.updateMany(
      { withdrawalRequestId } as Filter<StoredAttribution>,
      {
        $set: {
          status: "paid-out",
          lastStatusISO: now,
          paidOutISO: now,
          payoutMethod: payout.method,
          payoutReference: payout.reference,
          payoutNote: payout.note,
        },
      },
    );
    return { orderRefs, totalPaidMinor };
  }
  const all = await fileReadAll();
  const orderRefs: string[] = [];
  let totalPaidMinor = 0;
  for (const r of all) {
    if (r.withdrawalRequestId === withdrawalRequestId) {
      orderRefs.push(r.orderRef);
      totalPaidMinor += r.commissionAmountMinor ?? 0;
      r.status = "paid-out";
      r.lastStatusISO = now;
      r.paidOutISO = now;
      r.payoutMethod = payout.method;
      r.payoutReference = payout.reference;
      r.payoutNote = payout.note;
    }
  }
  await fileWriteAll(all);
  return { orderRefs, totalPaidMinor };
}
