// One-off migration: drop the `products` collection in Mongo and insert
// the current PRODUCTS catalog from lib/products.ts. Safe to re-run.
//
//   node scripts/reseed-products.mjs
//
// Needs MONGODB_URI (+ optional MONGODB_DB) from .env.local; loaded here
// so you don't need `next` to be running.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";
import { createRequire } from "node:module";
import { register } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

function loadEnv(p) {
  let txt = "";
  try {
    txt = readFileSync(p, "utf8");
  } catch {
    console.error(`Could not read ${p}`);
    process.exit(1);
  }
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnv(envPath);

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — nothing to re-seed.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "sphereofkings";

// Import the catalog from the TypeScript source by stripping the types
// off a copy — the file is pure data + a few helpers so we parse the
// PRODUCTS literal with a tiny regex/eval trick instead of needing ts-node.
async function loadProducts() {
  const txt = readFileSync(
    resolve(__dirname, "..", "lib", "products.ts"),
    "utf8",
  );
  // Extract the array literal starting at `PRODUCTS: Product[] = [` through
  // the matching `];`. Then evaluate it with `Function` in a scope that
  // defines nothing else.
  const start = txt.indexOf("PRODUCTS: Product[] = [");
  if (start < 0) throw new Error("PRODUCTS literal not found in products.ts");
  // Skip past the `Product[]` type annotation to the real array literal.
  const eq = txt.indexOf("= [", start);
  const arrStart = txt.indexOf("[", eq + 2);
  // Find the matching closing bracket by counting.
  let depth = 0;
  let end = -1;
  for (let i = arrStart; i < txt.length; i++) {
    const ch = txt[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error("could not find end of PRODUCTS array");
  const literal = txt.slice(arrStart, end + 1);
  // Safe eval of a pure data literal — no identifiers in the body.
  const fn = new Function(`return ${literal};`);
  return fn();
}

const PRODUCTS = await loadProducts();

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("products");

  const before = await col.estimatedDocumentCount();
  console.log(`products collection currently has ~${before} rows.`);

  console.log("Dropping products collection…");
  await col.drop().catch((e) => {
    if (e?.codeName === "NamespaceNotFound") {
      console.log(" (collection didn't exist — nothing to drop)");
    } else {
      throw e;
    }
  });

  const fresh = db.collection("products");
  await fresh.createIndex({ slug: 1 }, { unique: true });
  const res = await fresh.insertMany(PRODUCTS.map((p) => ({ ...p })));
  console.log(`Inserted ${res.insertedCount} products:`);
  for (const p of PRODUCTS) {
    const price =
      p.priceApproved && p.price
        ? `$${p.price.amount.toFixed(2)}`
        : "price pending";
    console.log(`  · ${p.slug.padEnd(28)} ${price}`);
  }
  console.log("Done.");
} finally {
  await client.close();
}
