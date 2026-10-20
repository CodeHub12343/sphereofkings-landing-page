#!/usr/bin/env node
// Import recovered subscriber emails into Mongo.
//
//   node scripts/import-subscribers.mjs [path]
//
// Default path: scripts/recovered-subscribers.txt
// Format: one email per line. Blank lines and lines starting with # are ignored.
//
// For each line:
//  • normalises to lower-case + trims whitespace
//  • validates email syntax (reports anything that fails)
//  • upserts into Mongo `subscribers` as:
//       status: "confirmed"
//       source: "formspree-recovery"
//       createdAt, confirmedAt: now
//  • skips rows that already exist (never overwrites a live row)
//
// Reports counts at the end: inserted / already-existed / invalid.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID, randomBytes } from "node:crypto";
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

const inputPath = resolve(process.cwd(),
  process.argv[2] ?? "scripts/recovered-subscribers.txt");

let raw;
try {
  raw = readFileSync(inputPath, "utf8");
} catch (err) {
  console.error("Could not read", inputPath, "-", err.message);
  process.exit(1);
}

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
const seen = new Set();
const parsed = [];
const invalid = [];

for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const email = t.toLowerCase();
  if (!EMAIL_RE.test(email)) { invalid.push(t); continue; }
  if (seen.has(email)) continue;
  seen.add(email);
  parsed.push(email);
}

console.log(`Parsed ${parsed.length} unique valid emails from ${inputPath}`);
if (invalid.length) {
  console.log("Invalid lines (skipped):");
  for (const i of invalid) console.log("  ", i);
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30_000,
  connectTimeoutMS: 30_000,
});
await client.connect();
try {
  const col = client.db(dbName).collection("subscribers");
  await col.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  const now = new Date().toISOString();

  let inserted = 0, existed = 0;
  for (const email of parsed) {
    const existing = await col.findOne({ email });
    if (existing) { existed++; continue; }
    await col.insertOne({
      id: randomUUID(),
      email,
      status: "confirmed",
      source: "formspree-recovery",
      createdAt: now,
      confirmedAt: now,
      // Even though these users already consented via the Formspree
      // signup, we mint a fresh unsubscribe token so the unsubscribe
      // link in the broadcast still works for them.
      unsubscribeToken: randomBytes(16).toString("hex"),
    });
    inserted++;
  }

  console.log("---");
  console.log(`inserted : ${inserted}`);
  console.log(`existed  : ${existed}`);
  console.log(`invalid  : ${invalid.length}`);
  const total = await col.countDocuments();
  const confirmed = await col.countDocuments({ status: "confirmed" });
  console.log(`subscribers now in Mongo: ${total} total, ${confirmed} confirmed`);
} finally {
  await client.close();
}
