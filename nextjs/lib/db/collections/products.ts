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
  mongoSeedChecked = true;
  const col = await getCollection<Product>(COLLECTION);
  await col.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
  const count = await col.estimatedDocumentCount();
  if (count === 0 && PRODUCTS.length > 0) {
    await col.insertMany(PRODUCTS.map((p) => ({ ...p }))).catch(() => {
      // Another process raced the seed; the collection has rows now
      // either way.
    });
  }
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
  } catch {
    return [];
  }
}

async function fileWriteAll(products: Product[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(
    PRODUCTS_PATH,
    JSON.stringify(products, null, 2),
    "utf8",
  );
}

/* -------------------------- Public API ----------------------------- */

export async function listProducts(): Promise<Product[]> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<Product>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ slug: 1 })
      .toArray();
  }
  return fileReadAll();
}

export async function findProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<Product>(COLLECTION);
    const doc = await col.findOne(
      { slug } as Filter<Product>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
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
