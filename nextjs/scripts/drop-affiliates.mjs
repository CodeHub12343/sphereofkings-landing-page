// One-off: drop the Mongo `affiliates` collection so the next request
// re-seeds it from SAMPLE_AFFILIATES with scrypt password hashes. Run
// after introducing the passwordHash field.
//
//   node scripts/drop-affiliates.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

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

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — nothing to do.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "sphereofkings";

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("affiliates");
  const before = await col.estimatedDocumentCount();
  console.log(`affiliates collection has ~${before} rows.`);
  await col.drop().catch((e) => {
    if (e?.codeName === "NamespaceNotFound") {
      console.log(" (collection didn't exist — nothing to drop)");
    } else {
      throw e;
    }
  });
  console.log(
    "Dropped. The next request to /admin/affiliates or /affiliate/signin will reseed from SAMPLE_AFFILIATES with scrypt password hashes.",
  );
} finally {
  await client.close();
}
