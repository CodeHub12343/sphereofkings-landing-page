// Quotes store. Two backends behind one public API:
//
//   - Mongo (preferred): used when `MONGODB_URI` is set in the
//     environment. Collection: `quotes`. Seeded from SAMPLE_QUOTES the
//     first time the collection is empty.
//   - File (dev fallback): writes to nextjs/.data/quotes.json so the
//     admin boots with content even on a laptop with no Mongo.
//
// Callers never pick a backend — the dispatch happens inside each
// exported function. Signatures stay stable, so swapping backends does
// not require touching any UI code.

import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter, UpdateFilter } from "mongodb";
import {
  SAMPLE_QUOTES,
  SampleQuote,
  QuoteState,
  QuoteLine,
} from "@/lib/sample-quotes";
import { getCollection, hasMongo } from "@/lib/db/mongo";

export type StoredQuote = SampleQuote & {
  checkoutToken?: string;
  reservationExpiresISO?: string;
  decisionNote?: string;
  stateUpdatedISO?: string;
  isUserSubmitted?: boolean;
  // Set the first time /wholesale-checkout/[token] produces a real
  // order. Prevents the same approval link being reused for multiple
  // orders at the same discount.
  tokenConsumedISO?: string;
  // Order ref the token was consumed into — surfaced in the admin so
  // the operator can jump straight to the paid wholesale order.
  consumedOrderRef?: string;
};

const COLLECTION = "quotes";
const DATA_DIR = path.join(process.cwd(), ".data");
const QUOTES_PATH = path.join(DATA_DIR, "quotes.json");

/* ------------------------- Mongo seeding --------------------------- */

let mongoSeedChecked = false;
async function ensureMongoSeeded(): Promise<void> {
  // Production posture: no demo rows are seeded. Admin wholesale queue
  // stays empty until a real buyer submits an inquiry through
  // /wholesale. The SAMPLE_QUOTES module is kept only as reference
  // material for tests. To re-enable sample seeding during a demo,
  // flip the block below.
  if (mongoSeedChecked) return;
  mongoSeedChecked = true;
  // Reference to keep the import linter from flagging the sample set
  // while we're not actively seeding from it.
  void SAMPLE_QUOTES;
}

async function mongoList(): Promise<StoredQuote[]> {
  await ensureMongoSeeded();
  const col = await getCollection<StoredQuote>(COLLECTION);
  return col
    .find({}, { projection: { _id: 0 } })
    .sort({ submittedISO: -1 })
    .toArray();
}

async function mongoFindOne(
  filter: Filter<StoredQuote>,
): Promise<StoredQuote | undefined> {
  await ensureMongoSeeded();
  const col = await getCollection<StoredQuote>(COLLECTION);
  const doc = await col.findOne(filter, { projection: { _id: 0 } });
  return doc ?? undefined;
}

async function mongoInsert(q: StoredQuote): Promise<void> {
  const col = await getCollection<StoredQuote>(COLLECTION);
  await col.insertOne({ ...q });
}

async function mongoUpdate(
  ref: string,
  patch: UpdateFilter<StoredQuote>,
): Promise<StoredQuote | undefined> {
  const col = await getCollection<StoredQuote>(COLLECTION);
  const result = await col.findOneAndUpdate({ ref }, patch, {
    returnDocument: "after",
    projection: { _id: 0 },
  });
  return result ?? undefined;
}

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(QUOTES_PATH);
  } catch {
    const seed: StoredQuote[] = SAMPLE_QUOTES.map((q) => ({
      ...q,
      isUserSubmitted: false,
    }));
    await fs.writeFile(QUOTES_PATH, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function fileReadAll(): Promise<StoredQuote[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(QUOTES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(quotes: StoredQuote[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(QUOTES_PATH, JSON.stringify(quotes, null, 2), "utf8");
}

/* -------------------------- Public API ----------------------------- */

export async function listQuotes(): Promise<StoredQuote[]> {
  if (hasMongo()) return mongoList();
  const quotes = await fileReadAll();
  return quotes
    .slice()
    .sort((a, b) => (a.submittedISO < b.submittedISO ? 1 : -1));
}

export async function getQuote(ref: string): Promise<StoredQuote | undefined> {
  if (hasMongo()) return mongoFindOne({ ref });
  const quotes = await fileReadAll();
  return quotes.find((q) => q.ref === ref);
}

export async function getQuoteByToken(
  token: string,
): Promise<StoredQuote | undefined> {
  if (hasMongo()) return mongoFindOne({ checkoutToken: token });
  const quotes = await fileReadAll();
  return quotes.find((q) => q.checkoutToken === token);
}

export type CreateQuoteInput = {
  business: string;
  contactName: string;
  email: string;
  phone?: string;
  requestedTier: "auto" | "40";
  autoTierPct: number;
  neededBy?: string;
  notes?: string;
  lines: QuoteLine[];
};

export async function createQuote(input: CreateQuoteInput): Promise<StoredQuote> {
  const now = new Date().toISOString();
  // Compute a monotonically-increasing ref off the current highest. For
  // Mongo we read against the live collection; for the file store we
  // read the on-disk snapshot. Both routes end up with the same shape.
  const existing = await listQuotes();
  const ref = nextRef(existing);
  const q: StoredQuote = {
    ref,
    submittedISO: now,
    business: input.business,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    requestedTier: input.requestedTier,
    autoTierPct: input.autoTierPct,
    neededBy: input.neededBy,
    notes: input.notes,
    lines: input.lines,
    state: "new",
    stateUpdatedISO: now,
    isUserSubmitted: true,
  };

  if (hasMongo()) {
    await mongoInsert(q);
    return q;
  }
  const all = await fileReadAll();
  all.push(q);
  await fileWriteAll(all);
  return q;
}

export async function updateQuoteState(
  ref: string,
  state: QuoteState,
  patch: Partial<StoredQuote> = {},
): Promise<StoredQuote | undefined> {
  const now = new Date().toISOString();

  if (hasMongo()) {
    // $unset any field explicitly cleared to undefined so Mongo doesn't
    // keep an old reservationExpiresISO after a decline.
    const set: Record<string, unknown> = { state, stateUpdatedISO: now };
    const unset: Record<string, "" > = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) unset[k] = "";
      else set[k] = v;
    }
    const update: UpdateFilter<StoredQuote> = { $set: set };
    if (Object.keys(unset).length > 0) {
      update.$unset = unset;
    }
    return mongoUpdate(ref, update);
  }

  const quotes = await fileReadAll();
  const i = quotes.findIndex((q) => q.ref === ref);
  if (i === -1) return;
  const next: StoredQuote = {
    ...quotes[i],
    ...patch,
    state,
    stateUpdatedISO: now,
  };
  quotes[i] = next;
  await fileWriteAll(quotes);
  return next;
}

export async function markQuoteConsumed(
  ref: string,
  orderRef: string,
): Promise<StoredQuote | undefined> {
  const now = new Date().toISOString();
  const patch: Partial<StoredQuote> = {
    tokenConsumedISO: now,
    consumedOrderRef: orderRef,
  };
  if (hasMongo()) {
    return mongoUpdate(ref, { $set: patch });
  }
  const quotes = await fileReadAll();
  const i = quotes.findIndex((q) => q.ref === ref);
  if (i === -1) return;
  quotes[i] = { ...quotes[i], ...patch };
  await fileWriteAll(quotes);
  return quotes[i];
}

function nextRef(quotes: StoredQuote[]): string {
  const highest = quotes
    .map((q) => Number.parseInt(q.ref.replace(/^WH-/, ""), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 100);
  return `WH-${String(highest + 1).padStart(4, "0")}`;
}
