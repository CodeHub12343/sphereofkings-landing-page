// Orders collection. Mongo-first with the usual file fallback at
// `.data/orders.json`. The admin OrderQueue + /order/[ref] both read
// from here. SAMPLE_ORDERS stays as a demo seed layer that merges in
// read paths — real stored orders always win over samples with the
// same ref.
//
// Pending orders are created at checkout time even though Stripe isn't
// wired yet; the admin sees a real queue instead of only sample rows.

import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter } from "mongodb";
import {
  FulfillmentState,
  PaymentState,
  OrderOrigin,
  SampleOrder,
  SAMPLE_ORDERS,
  ShipTo,
} from "@/lib/sample-orders";
import { getCollection, hasMongo } from "@/lib/db/mongo";

export type StoredOrderLine = {
  slug: string;
  name: string;
  qty: number;
};

export type StoredOrder = SampleOrder & {
  // Beyond SampleOrder: contact details, line items with slug+qty, and
  // free-text notes. Everything written by our own checkout; the
  // sample fallback carries the SampleOrder shape only.
  customerEmail?: string;
  customerPhone?: string;
  lines?: StoredOrderLine[];
  notes?: string;
  // The pay-step marker: present once createPendingOrderAction runs.
  createdByCheckoutISO?: string;
  // Stripe wiring. Populated when createPaymentIntentAction runs on
  // this order. The webhook uses `stripePaymentIntentId` to find and
  // flip the order to paid; the UI never reads `stripeClientSecret` —
  // that stays in the action's return value only.
  stripePaymentIntentId?: string;
  // Numeric total in minor units (cents). Only set when every line
  // has an approved price; checkout refuses to create a payment
  // intent otherwise.
  totalMinor?: number;
  // Wholesale: ref of the quote this order was placed against, and
  // the discount % applied to the retail subtotal before Stripe.
  wholesaleQuoteRef?: string;
  discountPct?: number;
};

const COLLECTION = "orders";
const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ORDERS_PATH);
  } catch {
    await fs.writeFile(ORDERS_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<StoredOrder[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(ORDERS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(orders: StoredOrder[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf8");
}

/* -------------------------- Mongo helpers -------------------------- */

let indexEnsured = false;
async function ensureMongoIndex(): Promise<void> {
  if (indexEnsured) return;
  indexEnsured = true;
  const col = await getCollection<StoredOrder>(COLLECTION);
  await col.createIndex({ ref: 1 }, { unique: true }).catch(() => {
    indexEnsured = false;
  });
}

/* -------------------------- Public API ----------------------------- */

export async function listStoredOrders(): Promise<StoredOrder[]> {
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<StoredOrder>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ placedISO: -1 })
      .toArray();
  }
  return fileReadAll();
}

// Previously merged SAMPLE_ORDERS so the admin queue wasn't empty on
// first boot. Production posture: real orders only. The function is
// kept under its old name so every caller continues to compile; it now
// simply returns listStoredOrders(). Keeping the SAMPLE_ORDERS import
// alive is harmless and leaves the sample set available for tests.
export async function listOrdersWithSamples(): Promise<StoredOrder[]> {
  void SAMPLE_ORDERS;
  return listStoredOrders();
}

export async function findOrderByRef(
  ref: string,
): Promise<StoredOrder | undefined> {
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<StoredOrder>(COLLECTION);
    const doc = await col.findOne(
      { ref } as Filter<StoredOrder>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  return all.find((o) => o.ref === ref);
}

/* -------------------------- Writes --------------------------------- */

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  origin: OrderOrigin;
  affiliateCode?: string;
  lines: StoredOrderLine[];
  itemSummary: string;
  totalDisplay: string;
  shipTo: ShipTo;
  wholesaleQuoteRef?: string;
  discountPct?: number;
};

export async function createPendingOrder(
  input: CreateOrderInput,
): Promise<StoredOrder> {
  const now = new Date().toISOString();
  const ref = await nextOrderRef();
  const order: StoredOrder = {
    ref,
    placedISO: now,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerEmailMasked: maskEmail(input.customerEmail),
    customerPhone: input.customerPhone,
    origin: input.origin,
    affiliateCode: input.affiliateCode,
    itemSummary: input.itemSummary,
    totalDisplay: input.totalDisplay,
    payment: "pending",
    fulfillment: "none",
    shipTo: input.shipTo,
    lines: input.lines,
    createdByCheckoutISO: now,
    wholesaleQuoteRef: input.wholesaleQuoteRef,
    discountPct: input.discountPct,
  };
  if (hasMongo()) {
    await ensureMongoIndex();
    const col = await getCollection<StoredOrder>(COLLECTION);
    await col.insertOne(order);
  } else {
    const all = await fileReadAll();
    all.push(order);
    await fileWriteAll(all);
  }
  return order;
}

export async function updateOrderPayment(
  ref: string,
  payment: PaymentState,
  patch: Partial<StoredOrder> = {},
): Promise<StoredOrder | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredOrder>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { ref } as Filter<StoredOrder>,
      { $set: { payment, ...patch } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((o) => o.ref === ref);
  if (i === -1) return;
  all[i] = { ...all[i], ...patch, payment };
  await fileWriteAll(all);
  return all[i];
}

export async function findOrderByPaymentIntent(
  intentId: string,
): Promise<StoredOrder | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredOrder>(COLLECTION);
    const doc = await col.findOne(
      { stripePaymentIntentId: intentId } as Filter<StoredOrder>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  return all.find((o) => o.stripePaymentIntentId === intentId);
}

export async function updateOrderFulfillment(
  ref: string,
  fulfillment: FulfillmentState,
): Promise<StoredOrder | undefined> {
  if (hasMongo()) {
    const col = await getCollection<StoredOrder>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { ref } as Filter<StoredOrder>,
      { $set: { fulfillment } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((o) => o.ref === ref);
  if (i === -1) return;
  all[i] = { ...all[i], fulfillment };
  await fileWriteAll(all);
  return all[i];
}

/* -------------------------- Helpers -------------------------------- */

async function nextOrderRef(): Promise<string> {
  // Highest ref currently in the store, +1. Floor at 4000 so refs stay
  // the same length as the ones already in production.
  const all = await (hasMongo()
    ? (async () => {
        const col = await getCollection<StoredOrder>(COLLECTION);
        return col
          .find({}, { projection: { _id: 0, ref: 1 } })
          .toArray();
      })()
    : fileReadAll());
  const highest = all
    .map((o) => Number.parseInt(o.ref.replace(/^SOK-/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 4000);
  return `SOK-${String(highest + 1).padStart(6, "0")}`;
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const trimmed = local.length > 2 ? local.slice(0, 2) : local[0] ?? "";
  return `${trimmed}@…`;
}
