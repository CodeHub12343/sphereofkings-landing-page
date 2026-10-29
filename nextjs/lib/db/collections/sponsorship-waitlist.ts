// Sponsorship waitlist — businesses who want to be notified when a
// slot in a given tier opens up. Separate collection from `sponsorships`
// so the admin can distinguish signed-up-but-not-paid interest from
// pending orders.

import { promises as fs } from "node:fs";
import path from "node:path";
import { Filter } from "mongodb";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import { SponsorshipTierId } from "@/lib/sponsorship";

export type SponsorshipWaitlistEntry = {
  tier: SponsorshipTierId;
  contactEmail: string;
  contactName: string;
  businessName: string;
  contactPhone?: string;
  businessWebsite?: string;
  notes?: string;
  createdISO: string;
  // Set once the "slot opened" email has been dispatched for this row,
  // so re-opens don't notify the same person twice for the same tier.
  notifiedISO?: string;
};

const COLLECTION = "sponsorship_waitlist";
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_PATH = path.join(DATA_DIR, "sponsorship-waitlist.json");

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

async function fileReadAll(): Promise<SponsorshipWaitlistEntry[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(rows: SponsorshipWaitlistEntry[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2), "utf8");
}

let mongoChecked = false;
async function ensureMongo(): Promise<void> {
  if (!hasMongo() || mongoChecked) return;
  mongoChecked = true;
  const col = await getCollection<SponsorshipWaitlistEntry>(COLLECTION);
  await col
    .createIndex(
      { tier: 1, contactEmail: 1 },
      { unique: true, collation: { locale: "en", strength: 2 } },
    )
    .catch(() => {});
}

export async function addWaitlistEntry(
  input: Omit<SponsorshipWaitlistEntry, "createdISO" | "notifiedISO">,
): Promise<SponsorshipWaitlistEntry> {
  const row: SponsorshipWaitlistEntry = {
    ...input,
    contactEmail: input.contactEmail.trim().toLowerCase(),
    createdISO: new Date().toISOString(),
  };
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<SponsorshipWaitlistEntry>(COLLECTION);
    // Upsert so a repeat sign-up refreshes the row rather than erroring.
    await col.updateOne(
      { tier: row.tier, contactEmail: row.contactEmail } as Filter<SponsorshipWaitlistEntry>,
      { $set: row },
      { upsert: true },
    );
    return row;
  }
  const rows = await fileReadAll();
  const existingIdx = rows.findIndex(
    (r) => r.tier === row.tier && r.contactEmail === row.contactEmail,
  );
  if (existingIdx >= 0) rows[existingIdx] = { ...rows[existingIdx], ...row };
  else rows.push(row);
  await fileWriteAll(rows);
  return row;
}

export async function listWaitlist(): Promise<SponsorshipWaitlistEntry[]> {
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<SponsorshipWaitlistEntry>(COLLECTION);
    return await col.find({}).sort({ createdISO: -1 }).toArray();
  }
  const rows = await fileReadAll();
  return rows.sort((a, b) => (a.createdISO < b.createdISO ? 1 : -1));
}

export async function listWaitlistByTier(
  tierId: SponsorshipTierId,
): Promise<SponsorshipWaitlistEntry[]> {
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<SponsorshipWaitlistEntry>(COLLECTION);
    return await col
      .find({ tier: tierId } as Filter<SponsorshipWaitlistEntry>)
      .sort({ createdISO: 1 })
      .toArray();
  }
  const rows = await fileReadAll();
  return rows
    .filter((r) => r.tier === tierId)
    .sort((a, b) => (a.createdISO > b.createdISO ? 1 : -1));
}
