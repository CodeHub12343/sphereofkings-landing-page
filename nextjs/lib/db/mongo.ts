// MongoDB connection singleton. The app's server actions and route
// handlers run on Node, so the official `mongodb` driver works directly
// here — no separate Express server needed. If you later want to split
// the API into a standalone Express service, every repository module
// (lib/db/collections/*.ts and the Mongo branches inside the stores)
// is self-contained and lifts cleanly.
//
// The connection is cached on `globalThis` so Next.js's hot-module
// reload doesn't open a new client on every edit, which would exhaust
// your connection pool in minutes.

import { MongoClient, Db } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "sphereofkings";

type Cached = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as unknown as {
  _mongoCached?: Cached;
};

const cached: Cached =
  globalForMongo._mongoCached ?? { client: null, promise: null };
globalForMongo._mongoCached = cached;

export function hasMongo(): boolean {
  return typeof URI === "string" && URI.length > 0;
}

async function getClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;
  if (!URI) {
    throw new Error(
      "MONGODB_URI is not set. Set it in .env.local to enable the Mongo backend, " +
        "or leave it unset to use the file-backed stores in nextjs/.data.",
    );
  }
  if (!cached.promise) {
    cached.promise = new MongoClient(URI, {
      // Reasonable defaults for a hobby/project-scale deployment. Bump
      // maxPoolSize and tune serverSelectionTimeoutMS before production.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8_000,
    })
      .connect()
      .then((c) => {
        cached.client = c;
        return c;
      })
      .catch((err) => {
        // Reset so a transient failure doesn't lock us into a bad
        // promise forever.
        cached.promise = null;
        throw err;
      });
  }
  return cached.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

// Small helper for one-shot collection access, used by repositories.
export async function getCollection<T extends object = Record<string, unknown>>(
  name: string,
) {
  const db = await getDb();
  return db.collection<T>(name);
}
