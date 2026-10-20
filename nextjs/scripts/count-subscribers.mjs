#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
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
} catch {}

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }
const dbName = process.env.MONGODB_DB ?? "sphereofkings";

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 45_000, connectTimeoutMS: 45_000, socketTimeoutMS: 45_000 });
await client.connect();
try {
  const col = client.db(dbName).collection("subscribers");
  const total = await col.estimatedDocumentCount();
  const confirmed = await col.countDocuments({ status: "confirmed" });
  const pending = await col.countDocuments({ status: { $ne: "confirmed" } });
  const bySource = await col.aggregate([
    { $group: { _id: "$source", n: { $sum: 1 } } },
  ]).toArray();
  const sample = await col.find({}, { projection: { email: 1, status: 1, source: 1, createdAt: 1, _id: 0 } })
    .sort({ createdAt: -1 }).limit(5).toArray();
  console.log("TOTAL subscribers:", total);
  console.log("  confirmed:", confirmed);
  console.log("  pending  :", pending);
  console.log("by source:", bySource);
  console.log("most recent 5:");
  for (const s of sample) console.log("  ", s);
} finally {
  await client.close();
}
