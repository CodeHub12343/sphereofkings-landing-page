// Products store. Mongo collection `products` with the usual file
// fallback (`.data/products.json`). Seeded from the PRODUCTS const in
// lib/products.ts on first use so the shop is never empty.
//
// Public shop pages (/shop, /shop/[slug]) call `listProducts()` /
// `findProduct()` here instead of importing the const directly, so
// admin edits land immediately. The const stays as the seed source and
// as a client-side fallback for the cart drawer's slug→display lookup.

import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter } from "mongodb";
import { PRODUCTS, Product } from "@/lib/products";
import { getCollection, hasMongo } from "@/lib/db/mongo";

const COLLECTION = "products";
const DATA_DIR = path.join(process.cwd(), ".data");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");

/* -------------------------- Seeding -------------------------------- */

let mongoSeedChecked = false;
async function ensureMongoSeeded(): Promise<void> {
  if (mongoSeedChecked) return;
  // Only flip the flag after a successful round-trip, so a transient
  // Atlas outage on the first request doesn't permanently skip the
  // seed on later requests.
  const col = await getCollection<Product>(COLLECTION);
  await col.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
  const count = await col.estimatedDocumentCount();
  if (count === 0 && PRODUCTS.length > 0) {
    await col.insertMany(PRODUCTS.map((p) => ({ ...p }))).catch(() => {
      // Another process raced the seed; the collection has rows now
      // either way.
    });
  }
  mongoSeedChecked = true;
}

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRODUCTS_PATH);
  } catch {
    await fs.writeFile(
      PRODUCTS_PATH,
      JSON.stringify(PRODUCTS, null, 2),
      "utf8",
    );
  }
}

async function fileReadAll(): Promise<Product[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(PRODUCTS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Corrupt file (two writers raced, truncated write, bad hand-edit).
    // Fall back to the seed catalog so the shop never appears empty.
    console.warn(
      "fileReadAll: products.json unreadable, falling back to PRODUCTS seed:",
      err instanceof Error ? err.message : err,
    );
    try {
      await fileWriteAll(PRODUCTS);
    } catch {}
    return PRODUCTS;
  }
}

async function fileWriteAll(products: Product[]): Promise<void> {
  await ensureFileStore();
  // Write to a temp file then rename — atomic swap on POSIX and
  // Windows NTFS. Prevents a half-written products.json leaving the
  // shop empty when a crash/race truncates the file.
  const tmp = `${PRODUCTS_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(products, null, 2), "utf8");
  await fs.rename(tmp, PRODUCTS_PATH);
}

/* -------------------------- Public API ----------------------------- */

function sortedFileRead(): Promise<Product[]> {
  return fileReadAll().then((rows) =>
    [...rows].sort((a, b) =>
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.slug.localeCompare(b.slug),
    ),
  );
}

export async function listProducts(): Promise<Product[]> {
  if (hasMongo()) {
    try {
      await ensureMongoSeeded();
      const col = await getCollection<Product>(COLLECTION);
      // Owner-signed ordering: rewards first (sortOrder 1..7), add-ons
      // after (8..13). Falls back to slug for any seed-less rows left
      // over from older runs.
      const rows = await col
        .find({}, { projection: { _id: 0 } })
        .sort({ sortOrder: 1, slug: 1 })
        .toArray();
      if (rows.length > 0) return rows;
    } catch (err) {
      // Transient Atlas timeout — degrade to the file store so dev
      // doesn't hang. The next request retries Mongo automatically.
      console.warn("listProducts: Mongo unavailable, falling back to file store:",
                   err instanceof Error ? err.message : err);
    }
  }
  return sortedFileRead();
}

export async function findProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (hasMongo()) {
    try {
      await ensureMongoSeeded();
      const col = await getCollection<Product>(COLLECTION);
      const doc = await col.findOne(
        { slug } as Filter<Product>,
        { projection: { _id: 0 } },
      );
      if (doc) return doc;
    } catch (err) {
      // Mongo unreachable (transient Atlas outage, DNS, firewall) —
      // fall back to the file store so detail pages still render.
      console.warn(
        "findProductBySlug: Mongo unavailable, falling back to file store:",
        err instanceof Error ? err.message : err,
      );
    }
  }
  const all = await fileReadAll();
  return all.find((p) => p.slug === slug);
}

export async function createProductRecord(input: Product): Promise<Product> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<Product>(COLLECTION);
    await col.insertOne({ ...input });
    return input;
  }
  const all = await fileReadAll();
  // Reject duplicate slug.
  if (all.some((p) => p.slug === input.slug)) {
    throw new Error(`Product slug already exists: ${input.slug}`);
  }
  all.unshift(input);
  await fileWriteAll(all);
  return input;
}

export async function updateProductRecord(
  slug: string,
  patch: Partial<Product>,
): Promise<Product | undefined> {
  if (hasMongo()) {
    const col = await getCollection<Product>(COLLECTION);
    // $set only the provided keys so untouched fields stay as-is.
    const result = await col.findOneAndUpdate(
      { slug } as Filter<Product>,
      { $set: patch },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return result ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return;
  all[i] = { ...all[i], ...patch };
  await fileWriteAll(all);
  return all[i];
}

/**
 * Add (positive) or release (negative) reserved units on a product.
 * Caps at zero on the low end so a double-release can't go negative.
 */
export async function adjustReservedUnits(
  slug: string,
  delta: number,
): Promise<Product | undefined> {
  if (!Number.isFinite(delta) || delta === 0) return findProductBySlug(slug);
  if (hasMongo()) {
    const col = await getCollection<Product>(COLLECTION);
    const current = await col.findOne(
      { slug } as Filter<Product>,
      { projection: { _id: 0 } },
    );
    if (!current) return;
    const nextReserved = Math.max(0, (current.reservedUnits ?? 0) + delta);
    const result = await col.findOneAndUpdate(
      { slug } as Filter<Product>,
      { $set: { reservedUnits: nextReserved } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return result ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return;
  const nextReserved = Math.max(0, (all[i].reservedUnits ?? 0) + delta);
  all[i] = { ...all[i], reservedUnits: nextReserved };
  await fileWriteAll(all);
  return all[i];
}

export async function deleteProductRecord(slug: string): Promise<boolean> {
  if (hasMongo()) {
    const col = await getCollection<Product>(COLLECTION);
    const result = await col.deleteOne({ slug } as Filter<Product>);
    return result.deletedCount === 1;
  }
  const all = await fileReadAll();
  const next = all.filter((p) => p.slug !== slug);
  if (next.length === all.length) return false;
  await fileWriteAll(next);
  return true;
}
