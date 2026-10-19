#!/usr/bin/env node
// Seed the official puzzle catalogue into Mongo.
//
// Usage:   MONGODB_URI="..." node scripts/seed-puzzles.mjs
//
// Idempotent — upserts by slug.

import { MongoClient } from "mongodb";
import { PUZZLES } from "../lib/games/puzzles/official.ts";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "sphereofkings";

const client = new MongoClient(uri);
await client.connect();
try {
  const db = client.db(dbName);
  const col = db.collection("puzzles");
  await col.createIndex({ slug: 1 }, { unique: true });
  let upserts = 0;
  for (const p of PUZZLES) {
    await col.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
    upserts++;
  }
  console.log(`seeded ${upserts} puzzles into ${dbName}.puzzles`);
} finally {
  await client.close();
}
