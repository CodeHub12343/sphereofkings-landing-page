// One-off: strip ONLY the seeded demo rows from Mongo.
// Real test orders, real admin users, the live product catalog, and
// any self-signup affiliates / wholesale inquiries are preserved.
//
//   node scripts/drop-demo-data.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MongoClient } from "mongodb";

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
  // env can also come from the shell
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing — nothing to do.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "sphereofkings";

// Seeded affiliate codes (from lib/sample-affiliates.ts).
// Self-signup codes use the pattern SOV-###-XXXX (with a dash before
// the 4-char suffix), so leaving the two "SOV-001" / "SOV-002" seeded
// legacy codes in this list only removes those two specific demo rows.
const SEEDED_AFFILIATE_CODES = [
  "POSTER-247",
  "ROYAL-012",
  "KINGDOM-034",
  "SOV-001",
  "SOV-002",
  "ROYAL-007",
];

// Seeded wholesale quote refs (from lib/sample-quotes.ts).
const SEEDED_QUOTE_REFS = [
  "WH-0128",
  "WH-0127",
  "WH-0124",
  "WH-0119",
  "WH-0117",
  "WH-0114",
  "WH-0098",
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);

  // Affiliates — delete only the seeded codes, preserve real signups.
  const affRes = await db
    .collection("affiliates")
    .deleteMany({ code: { $in: SEEDED_AFFILIATE_CODES } });
  console.log(`affiliates: dropped ${affRes.deletedCount} seeded rows`);

  // Quotes — delete only the seeded refs, preserve real inquiries.
  const quoteRes = await db
    .collection("quotes")
    .deleteMany({ ref: { $in: SEEDED_QUOTE_REFS } });
  console.log(`quotes:     dropped ${quoteRes.deletedCount} seeded rows`);

  // Attribution rows that referenced seeded affiliates should go too,
  // since those affiliate codes no longer exist.
  const attRes = await db
    .collection("attributedOrders")
    .deleteMany({ affiliateCode: { $in: SEEDED_AFFILIATE_CODES } });
  console.log(
    `attributedOrders: dropped ${attRes.deletedCount} seeded-affiliate rows`,
  );

  console.log("Done. Admin pages will now show empty states where seeded data used to be.");
} finally {
  await client.close();
}
