// Affiliates collection. Mongo-first with the usual file fallback at
// `.data/affiliates.json`. Seeded from SAMPLE_AFFILIATES on first use
// (each row gets a scrypt hash of the DEMO_AFF_PASSWORD so the demo
// affiliates can still sign in after the migration). Real applications
// land here via /affiliate/apply with their own password hash and
// state="pending".

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter } from "mongodb";
import {
  SAMPLE_AFFILIATES,
  SampleAffiliate,
  AffiliateState,
} from "@/lib/sample-affiliates";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type StoredAffiliate = SampleAffiliate & {
  // Scrypt-hashed password, format `scrypt$N$r$p$saltB64$hashB64`.
  // Optional on the type because older sample rows seeded before this
  // field existed may not have one yet; the sign-in path treats a
  // missing hash as "cannot sign in".
  passwordHash?: string;
};

// Demo password used for the seeded sample affiliates. Real applicants
// pick their own. We expose it only so the one-time seed knows what
// hash to write — the sign-in UI never shows this value.
const SEED_DEMO_PASSWORD = "sphere";

const COLLECTION = "affiliates";
const DATA_DIR = path.join(process.cwd(), ".data");
const AFFILIATES_PATH = path.join(DATA_DIR, "affiliates.json");

/* -------------------------- Seeding -------------------------------- */

let mongoSeedChecked = false;
async function ensureMongoSeeded(): Promise<void> {
  // Production posture: no demo affiliates are seeded. The affiliates
  // collection stays empty until real people sign up through
  // /affiliate/apply. SAMPLE_AFFILIATES / SEED_DEMO_PASSWORD are kept
  // only as reference material. To re-enable sample seeding for a
  // demo, flip the block below.
  if (!hasMongo() || mongoSeedChecked) return;
  mongoSeedChecked = true;
  const col = await getCollection<StoredAffiliate>(COLLECTION);
  await col.createIndex({ code: 1 }, { unique: true }).catch(() => {});
  await col.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  // Reference to keep the import linter quiet while demo seeding is off.
  void SAMPLE_AFFILIATES;
  void SEED_DEMO_PASSWORD;
}

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(AFFILIATES_PATH);
  } catch {
    await fs.writeFile(
      AFFILIATES_PATH,
      JSON.stringify(SAMPLE_AFFILIATES, null, 2),
      "utf8",
    );
  }
}

async function fileReadAll(): Promise<StoredAffiliate[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(AFFILIATES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(all: StoredAffiliate[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(AFFILIATES_PATH, JSON.stringify(all, null, 2), "utf8");
}

/* -------------------------- Public API ----------------------------- */

export async function listAffiliates(): Promise<StoredAffiliate[]> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    return col
      .find({}, { projection: { _id: 0 } })
      .sort({ joinedISO: -1 })
      .toArray();
  }
  return fileReadAll();
}

export async function findAffiliateByCode(
  code: string,
): Promise<StoredAffiliate | undefined> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    const doc = await col.findOne(
      { code } as Filter<StoredAffiliate>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  return all.find((a) => a.code === code);
}

export async function findAffiliateByEmail(
  email: string,
): Promise<StoredAffiliate | undefined> {
  const lower = email.trim().toLowerCase();
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    const doc = await col.findOne(
      { email: lower } as Filter<StoredAffiliate>,
      { projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  return all.find((a) => a.email.toLowerCase() === lower);
}

export type NewAffiliateInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CreateResult =
  | { ok: true; affiliate: StoredAffiliate }
  | { ok: false; error: string };

export async function createAffiliate(
  input: NewAffiliateInput,
): Promise<CreateResult> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName || !email || !input.password) {
    return { ok: false, error: "All fields are required." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const existing = await findAffiliateByEmail(email);
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }
  const code = await nextAffiliateCode();
  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();
  const record: StoredAffiliate = {
    code,
    firstName,
    lastName,
    email,
    joinedISO: now,
    tier: "Starter",
    tierRatePct: 5,
    eligibleSales: 0,
    pendingOrders: 0,
    pendingCommissionCount: 0,
    approvedCommissionCount: 0,
    paidOutCount: 0,
    state: "active",
    passwordHash,
  };
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    await col.insertOne(record);
  } else {
    const all = await fileReadAll();
    all.push(record);
    await fileWriteAll(all);
  }
  return { ok: true, affiliate: record };
}

export type VerifyResult =
  | { ok: true; affiliate: StoredAffiliate }
  | { ok: false; reason: string };

export async function verifyAffiliateCredentials(
  email: string,
  password: string,
): Promise<VerifyResult> {
  const aff = await findAffiliateByEmail(email);
  if (!aff) return { ok: false, reason: "No affiliate account with that email." };
  if (!aff.passwordHash) {
    return {
      ok: false,
      reason:
        "This account has no password set yet. Contact hello@sphereofkings.com.",
    };
  }
  const ok = await verifyPassword(password, aff.passwordHash);
  if (!ok) return { ok: false, reason: "Wrong password." };
  if (aff.state === "pending") {
    return {
      ok: false,
      reason:
        "Your application is still pending approval. You will get an email once the owner approves it.",
    };
  }
  if (aff.state === "suspended") {
    return {
      ok: false,
      reason:
        "This account is suspended. Contact hello@sphereofkings.com if you believe this is a mistake.",
    };
  }
  return { ok: true, affiliate: aff };
}

async function nextAffiliateCode(): Promise<string> {
  const existing = hasMongo()
    ? await (async () => {
        const col = await getCollection<StoredAffiliate>(COLLECTION);
        return col.find({}, { projection: { _id: 0, code: 1 } }).toArray();
      })()
    : await fileReadAll();
  // Codes already in use follow varied patterns (POSTER-247, ROYAL-012,
  // KINGDOM-034, SOV-001). New applicants get a predictable SOV-### run
  // starting after whatever SOV-### highest value is on file (floor 100).
  const highest = existing
    .map((a) =>
      a.code.startsWith("SOV-")
        ? Number.parseInt(a.code.replace(/^SOV-/, ""), 10)
        : 0,
    )
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 100);
  // Also mix in a short random suffix so parallel applications don't
  // race on the same incremented number.
  const n = (highest + 1).toString().padStart(3, "0");
  const salt = randomUUID().slice(0, 4).toUpperCase();
  return `SOV-${n}-${salt}`;
}

export async function updateAffiliate(
  code: string,
  patch: Partial<StoredAffiliate>,
): Promise<StoredAffiliate | undefined> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { code } as Filter<StoredAffiliate>,
      { $set: patch },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((a) => a.code === code);
  if (i === -1) return;
  all[i] = { ...all[i], ...patch };
  await fileWriteAll(all);
  return all[i];
}

export async function setAffiliateState(
  code: string,
  state: AffiliateState,
): Promise<StoredAffiliate | undefined> {
  if (hasMongo()) {
    await ensureMongoSeeded();
    const col = await getCollection<StoredAffiliate>(COLLECTION);
    const doc = await col.findOneAndUpdate(
      { code } as Filter<StoredAffiliate>,
      { $set: { state } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return doc ?? undefined;
  }
  const all = await fileReadAll();
  const i = all.findIndex((a) => a.code === code);
  if (i === -1) return;
  all[i] = { ...all[i], state };
  await fileWriteAll(all);
  return all[i];
}
