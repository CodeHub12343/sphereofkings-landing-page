// One-off: insert an additional admin user into Mongo.
// Usage:
//   node scripts/add-admin.mjs <email> <password> [displayName] [role]
//
//   node scripts/add-admin.mjs admin@example.com "<strong-password>" "Display Name" fulfillment
//
// Password is hashed with the SAME scrypt format the signin flow
// expects (lib/auth/password.ts). Role defaults to "fulfillment".

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCb,
} from "node:crypto";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";

const scrypt = promisify(scryptCb);

/* -------------------------- Load .env.local ------------------------- */

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const txt = readFileSync(envPath, "utf8");
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
} catch {
  // ignore — maybe env is already present from the shell
}

/* -------------------------- CLI args -------------------------------- */

const [, , emailArg, passwordArg, displayNameArg, roleArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error(
    "Usage: node scripts/add-admin.mjs <email> <password> [displayName] [role]",
  );
  process.exit(1);
}
const email = emailArg.trim().toLowerCase();
const password = passwordArg;
const displayName = displayNameArg || prettyName(email);
const role = (roleArg || "fulfillment").toLowerCase();
const VALID_ROLES = ["owner", "finance", "support", "fulfillment"];
if (!VALID_ROLES.includes(role)) {
  console.error(`Invalid role: ${role}. Must be one of ${VALID_ROLES.join(", ")}.`);
  process.exit(1);
}

function prettyName(e) {
  const base = e.split("@")[0] ?? e;
  return base
    .replace(/[._-]+/g, " ")
    .replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
}

/* -------------------------- scrypt helper --------------------------- */

async function hashPassword(plain) {
  // Mirrors lib/auth/password.ts exactly, including the 64 MiB maxmem
  // bump that the N=16384,r=8 combo needs beyond Node's 32 MiB default.
  const N = 16384;
  const r = 8;
  const p = 1;
  const KEY_LEN = 64;
  const MAX_MEM = 64 * 1024 * 1024;
  const salt = randomBytes(16);
  const hash = await scrypt(plain, salt, KEY_LEN, { N, r, p, maxmem: MAX_MEM });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/* -------------------------- Mongo write ----------------------------- */

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — nothing to do.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "sphereofkings";

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db(dbName).collection("adminUsers");

  const existing = await col.findOne({ email });
  if (existing) {
    console.error(`Admin ${email} already exists. Delete the record first if you want to re-create it.`);
    process.exit(1);
  }

  await col.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    email,
    displayName,
    role,
    passwordHash: await hashPassword(password),
    createdISO: now,
  };
  await col.insertOne(record);
  console.log("Admin created:");
  console.log(`  email       ${record.email}`);
  console.log(`  displayName ${record.displayName}`);
  console.log(`  role        ${record.role}`);
  console.log(`  id          ${record.id}`);
  console.log("Sign in at /admin/signin with the password you supplied.");
} finally {
  await client.close();
}
