#!/usr/bin/env node
// Drop + re-insert the full product catalog from lib/products.ts.
//
//   MONGODB_URI="..." node scripts/reseed-products.mjs
//
// Safe to re-run. Preserves no admin-edited copy — if you have live
// catalog edits, back them up first.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

function loadEnv(p) {
  try {
    const txt = readFileSync(p, "utf8");
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    // Env file optional — rely on process.env if it's not here.
  }
}
loadEnv(envPath);

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set — add it to .env.local or export it before running.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "sphereofkings";

// Load PRODUCTS via tsx so we don't duplicate the catalog in JS.
const mod = await import("../lib/products.ts");
const PRODUCTS = mod.PRODUCTS;

const client = new MongoClient(uri);
await client.connect();
try {
  const db = client.db(dbName);
  const col = db.collection("products");
  const before = await col.estimatedDocumentCount();
  await col.deleteMany({});
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.createIndex({ sortOrder: 1 });
  if (PRODUCTS.length > 0) await col.insertMany(PRODUCTS);
  const after = await col.countDocuments();
  console.log(`reseed: removed ${before}, inserted ${PRODUCTS.length}, final ${after}`);
} finally {
  await client.close();
}
