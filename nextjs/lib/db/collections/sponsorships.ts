// Sponsorships collection. Stores both paid sponsorship purchases and
// pending orders awaiting Stripe confirmation. A unique index on `ref`
// keeps lookups fast; counts of state=paid rows per tier drive the live
// "slots remaining" number on the public page.
//
// Mongo-first with the usual file fallback at `.data/sponsorships.json`
// so local dev without Mongo still works.

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { Filter } from "mongodb";
import { getCollection, hasMongo } from "@/lib/db/mongo";
import { SponsorshipTierId } from "@/lib/sponsorship";

export type SponsorshipState = "pending" | "paid" | "failed" | "refunded";

// A single piece of campaign work logged by the admin. Each entry
// increments the "delivered" count against the tier's commitments and
// shows up as a line in the sponsor's dashboard activity feed.
export type SponsorshipActivityKind =
  | "shoutout"
  | "video"
  | "boosted-post"
  | "appreciation-post"
  | "spotlight"
  | "dedicated-video"
  | "report"
  | "note";

export type SponsorshipActivity = {
  id: string;
  kind: SponsorshipActivityKind;
  // Admin-written headline shown to the sponsor.
  summary: string;
  // Optional public URL (Instagram post, YouTube link, PDF report).
  url?: string;
  // Platform/channel label (Instagram, Facebook, TikTok, Website…).
  channel?: string;
  // ISO date the work was published (not when the row was logged).
  publishedISO: string;
  createdISO: string;
  createdBy?: string;
};

export type SponsorshipBrandAssets = {
  logoUrl?: string;
  description?: string;
  // The website the sponsor wants linked from the Sphere of Kings site.
  linkUrl?: string;
  // Updated by the sponsor through the dashboard.
  updatedISO?: string;
};

// One-time magic-link token stored on the row. The link URL is
// /sponsor/signin/<token>; it is single-use (consumedISO) and short-
// lived (expiresISO). Keeping it on the row avoids a separate tokens
// collection for the single magic-link use-case.
export type SponsorMagicLink = {
  token: string;
  expiresISO: string;
  consumedISO?: string;
};

export type StoredSponsorship = {
  ref: string;
  tier: SponsorshipTierId;
  state: SponsorshipState;
  priceMinor: number;
  // Business + buyer contact details.
  businessName: string;
  businessWebsite?: string;
  businessCategory?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
  // Stripe wiring. Set by createSponsorshipPaymentIntentAction; the
  // webhook finds the row by paymentIntentId and flips state to paid.
  stripePaymentIntentId?: string;
  createdISO: string;
  paidISO?: string;
  updatedISO: string;
  // Campaign tracking: when the 90-day window formally started. Set
  // automatically on first paid webhook, overridable by admin.
  campaignStartISO?: string;
  // Deliverables + brand assets + sponsor-portal auth.
  activities?: SponsorshipActivity[];
  brandAssets?: SponsorshipBrandAssets;
  magicLink?: SponsorMagicLink;
};

const COLLECTION = "sponsorships";
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_PATH = path.join(DATA_DIR, "sponsorships.json");

/* -------------------------- File backend --------------------------- */

async function ensureFileStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

async function fileReadAll(): Promise<StoredSponsorship[]> {
  await ensureFileStore();
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fileWriteAll(rows: StoredSponsorship[]): Promise<void> {
  await ensureFileStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(rows, null, 2), "utf8");
}

/* -------------------------- Mongo seed ----------------------------- */

let mongoChecked = false;
async function ensureMongo(): Promise<void> {
  if (!hasMongo() || mongoChecked) return;
  mongoChecked = true;
  const col = await getCollection<StoredSponsorship>(COLLECTION);
  await col.createIndex({ ref: 1 }, { unique: true }).catch(() => {});
  await col.createIndex({ tier: 1, state: 1 }).catch(() => {});
  await col.createIndex({ stripePaymentIntentId: 1 }).catch(() => {});
}

/* -------------------------- Helpers -------------------------------- */

export function makeSponsorshipRef(): string {
  // SPN-XXXXX. Short, uppercase, URL-safe, collision-resistant for the
  // volumes we expect (dozens, not millions).
  const bytes = randomBytes(4).toString("hex").toUpperCase().slice(0, 7);
  return `SPN-${bytes}`;
}

/* -------------------------- Public API ----------------------------- */

export async function createPendingSponsorship(
  input: Omit<
    StoredSponsorship,
    "ref" | "state" | "createdISO" | "updatedISO" | "stripePaymentIntentId" | "paidISO"
  >,
): Promise<StoredSponsorship> {
  const now = new Date().toISOString();
  const row: StoredSponsorship = {
    ...input,
    ref: makeSponsorshipRef(),
    state: "pending",
    createdISO: now,
    updatedISO: now,
  };
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<StoredSponsorship>(COLLECTION);
    await col.insertOne(row);
    return row;
  }
  const rows = await fileReadAll();
  rows.push(row);
  await fileWriteAll(rows);
  return row;
}

export async function findSponsorshipByRef(
  ref: string,
): Promise<StoredSponsorship | null> {
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      return (await col.findOne({ ref } as Filter<StoredSponsorship>)) ?? null;
    } catch {
      // Mongo unreachable — fall through to the file store so a
      // transient outage doesn't 500 the pay / thanks page.
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  return rows.find((r) => r.ref === ref) ?? null;
}

export async function findSponsorshipByPaymentIntent(
  piId: string,
): Promise<StoredSponsorship | null> {
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<StoredSponsorship>(COLLECTION);
    return (
      (await col.findOne({
        stripePaymentIntentId: piId,
      } as Filter<StoredSponsorship>)) ?? null
    );
  }
  const rows = await fileReadAll();
  return rows.find((r) => r.stripePaymentIntentId === piId) ?? null;
}

export async function updateSponsorshipPayment(
  ref: string,
  state: SponsorshipState,
  patch: Partial<Pick<StoredSponsorship, "stripePaymentIntentId">> = {},
): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<StoredSponsorship>(COLLECTION);
    const set: Partial<StoredSponsorship> = {
      state,
      updatedISO: now,
      ...patch,
    };
    if (state === "paid") set.paidISO = now;
    await col.updateOne({ ref } as Filter<StoredSponsorship>, { $set: set });
    return;
  }
  const rows = await fileReadAll();
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  rows[i] = {
    ...rows[i],
    state,
    updatedISO: now,
    ...(state === "paid" ? { paidISO: now } : {}),
    ...patch,
  };
  await fileWriteAll(rows);
}

export async function listSponsorships(): Promise<StoredSponsorship[]> {
  if (hasMongo()) {
    await ensureMongo();
    const col = await getCollection<StoredSponsorship>(COLLECTION);
    return await col.find({}).sort({ createdISO: -1 }).toArray();
  }
  const rows = await fileReadAll();
  return rows.sort((a, b) => (a.createdISO < b.createdISO ? 1 : -1));
}

/* -------------------- Sponsor-portal helpers --------------------- */

export async function findPaidSponsorshipByEmail(
  email: string,
): Promise<StoredSponsorship | null> {
  const needle = email.trim().toLowerCase();
  if (!needle) return null;
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      return (
        (await col.findOne({
          contactEmail: needle,
          state: "paid",
        } as Filter<StoredSponsorship>)) ?? null
      );
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  return (
    rows.find((r) => r.state === "paid" && r.contactEmail === needle) ?? null
  );
}

export async function findSponsorshipByMagicToken(
  token: string,
): Promise<StoredSponsorship | null> {
  if (!token) return null;
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      return (
        (await col.findOne({
          "magicLink.token": token,
        } as Filter<StoredSponsorship>)) ?? null
      );
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  return rows.find((r) => r.magicLink?.token === token) ?? null;
}

export async function setMagicLink(
  ref: string,
  link: SponsorMagicLink,
): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $set: { magicLink: link, updatedISO: now },
      });
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  rows[i] = { ...rows[i], magicLink: link, updatedISO: now };
  await fileWriteAll(rows);
}

export async function consumeMagicLink(ref: string): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $set: { "magicLink.consumedISO": now, updatedISO: now },
      });
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0 || !rows[i].magicLink) return;
  rows[i] = {
    ...rows[i],
    magicLink: { ...rows[i].magicLink!, consumedISO: now },
    updatedISO: now,
  };
  await fileWriteAll(rows);
}

export async function addSponsorshipActivity(
  ref: string,
  activity: SponsorshipActivity,
): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $push: { activities: activity },
        $set: { updatedISO: now },
      } as unknown as Parameters<typeof col.updateOne>[1]);
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  const list = Array.isArray(rows[i].activities) ? rows[i].activities! : [];
  rows[i] = {
    ...rows[i],
    activities: [...list, activity],
    updatedISO: now,
  };
  await fileWriteAll(rows);
}

export async function removeSponsorshipActivity(
  ref: string,
  activityId: string,
): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $pull: { activities: { id: activityId } },
        $set: { updatedISO: now },
      } as unknown as Parameters<typeof col.updateOne>[1]);
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  rows[i] = {
    ...rows[i],
    activities: (rows[i].activities ?? []).filter((a) => a.id !== activityId),
    updatedISO: now,
  };
  await fileWriteAll(rows);
}

export async function updateSponsorBrandAssets(
  ref: string,
  patch: SponsorshipBrandAssets,
): Promise<void> {
  const now = new Date().toISOString();
  const assets: SponsorshipBrandAssets = { ...patch, updatedISO: now };
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $set: { brandAssets: assets, updatedISO: now },
      });
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  rows[i] = { ...rows[i], brandAssets: assets, updatedISO: now };
  await fileWriteAll(rows);
}

export async function setCampaignStart(
  ref: string,
  startISO: string,
): Promise<void> {
  const now = new Date().toISOString();
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      await col.updateOne({ ref } as Filter<StoredSponsorship>, {
        $set: { campaignStartISO: startISO, updatedISO: now },
      });
      return;
    } catch {
      // fall through
    }
  }
  const rows = await fileReadAll().catch(() => [] as StoredSponsorship[]);
  const i = rows.findIndex((r) => r.ref === ref);
  if (i < 0) return;
  rows[i] = { ...rows[i], campaignStartISO: startISO, updatedISO: now };
  await fileWriteAll(rows);
}

// Count rows that occupy a slot. Pending rows hold the slot during the
// Stripe payment window — otherwise two shoppers could race through the
// payment form against the same remaining count. We don't expire these
// here; the admin can mark stale pendings as failed if needed. Failed
// and refunded rows free the slot.
export async function countOccupiedByTier(
  tierId: SponsorshipTierId,
): Promise<number> {
  // Mongo-first with a file fallback. If Mongo is configured but the
  // connection is down (dev laptop offline, Atlas replica-set flap), we
  // DON'T want the public /sponsorship page to 500 — fall back to the
  // file store and, failing that, assume zero occupied. Over-reporting
  // availability briefly is far better than a dead landing page.
  if (hasMongo()) {
    try {
      await ensureMongo();
      const col = await getCollection<StoredSponsorship>(COLLECTION);
      return await col.countDocuments({
        tier: tierId,
        state: { $in: ["pending", "paid"] },
      } as Filter<StoredSponsorship>);
    } catch {
      // Fall through to the file store.
    }
  }
  try {
    const rows = await fileReadAll();
    return rows.filter(
      (r) => r.tier === tierId && (r.state === "pending" || r.state === "paid"),
    ).length;
  } catch {
    return 0;
  }
}
