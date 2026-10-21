#!/usr/bin/env node
// One-off migration: repair subscriber rows written by the old version
// of import-subscribers.mjs that used wrong field names + status/source
// values.
//
// Old (broken) shape : { status: "confirmed", source: "formspree-recovery",
//                        createdAt, confirmedAt }
// New (schema) shape : { status: "consented", source: "import",
//                        createdISO, confirmedISO, confirmToken }
//
// Idempotent — only touches rows whose status is "confirmed" (invalid).
// Rows already matching the schema are left alone.
//
//   node scripts/fix-imported-subscribers.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  for (const raw of readFileSync(envPath, "utf8").split(/\r?\n/)) {
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
} catch { /* .env.local optional */ }

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "sphereofkings";

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30_000,
  connectTimeoutMS: 30_000,
});
await client.connect();
try {
  const col = client.db(dbName).collection("subscribers");
  const broken = await col.find({ status: "confirmed" }).toArray();
  console.log(`Found ${broken.length} broken rows to repair.`);

  let fixed = 0;
  for (const r of broken) {
    const createdISO = r.createdISO ?? r.createdAt ?? new Date().toISOString();
    const confirmedISO = r.confirmedISO ?? r.confirmedAt ?? createdISO;
    await col.updateOne(
      { _id: r._id },
      {
        $set: {
          status: "consented",
          source: "import",
          createdISO,
          confirmedISO,
          confirmToken: r.confirmToken ?? randomBytes(16).toString("hex"),
          unsubscribeToken: r.unsubscribeToken ?? randomBytes(16).toString("hex"),
        },
        $unset: {
          createdAt: "",
          confirmedAt: "",
          id: "",
        },
      },
    );
    fixed++;
  }

  console.log(`Repaired ${fixed} rows.`);
  const total = await col.countDocuments();
  const consented = await col.countDocuments({ status: "consented" });
  console.log(`subscribers now in Mongo: ${total} total, ${consented} consented`);
} finally {
  await client.close();
}
