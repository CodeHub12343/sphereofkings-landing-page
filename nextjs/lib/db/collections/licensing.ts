import "server-only";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";
import { getDb } from "@/lib/db/mongo";

// Designer licensing marketplace.
//
// Flow:
//  1. Owner of a completed sphere puzzle (originally bought via
//     "Custom 3D Puzzle Upload" or any sphere they designed) submits
//     an application with photos, pricing proposal, personal info.
//  2. Application lands in /admin/license-applications as "pending".
//  3. Admin reviews → marks "approved" or "rejected".
//  4. If approved, applicant is prompted to pay the $5,000 submission
//     fee via Stripe. Only after Stripe confirms is the license
//     active and the design listed for sale (via a future catalog
//     entry — a separate ship).
//  5. Each sale of the licensed design books a `licenseSales` row.
//     Commission tier auto-promotes from 10% → 15% once 1,000 units
//     sold under the same license.
//
// Legal: license agreement + NDA/non-compete are generated as PDFs
// when the admin approves, and the applicant must click-sign them
// before the $5,000 charge can fire. Templates stay in /content/legal
// and are owner-signed.

export type LicenseStatus =
  | "draft"                 // applicant started but hasn't submitted
  | "submitted"             // waiting for admin review
  | "under-review"          // admin is actively reviewing
  | "approved-fee-pending"  // approved, waiting on $5k Stripe charge
  | "approved-docs-pending" // paid, awaiting NDA + license click-sign
  | "licensed"              // live, earning commissions
  | "rejected"
  | "revoked";

export const SUBMISSION_FEE_CENTS = 500000; // $5,000 USD (owner spec)
export const COMMISSION_TIER_1 = 0.10;      // 10% default (owner spec)
export const COMMISSION_TIER_2 = 0.15;      // 15% after 1,000 units
export const TIER_UPGRADE_UNITS = 1000;

export interface LicenseAgreementDoc {
  // Click-sign receipt. We keep hash + timestamp + ip; the full PDF
  // lives in Blob storage keyed by the license id.
  signedAt: string;
  signatureHash: string;
  ipHash: string;
  version: string;
}

export interface LicenseApplication {
  _id?: ObjectId;
  id: string;
  playerId: string;        // signed-in player who owns the submission
  playerDisplayName: string;
  playerEmail: string;

  // The submission.
  title: string;
  description: string;
  // Up to 10 photo URLs (Vercel Blob or embedded data URLs). The
  // uploader validates size + moderation before admin sees them.
  photoUrls: string[];
  // Owner's proposed retail price in USD cents.
  proposedPriceCents: number;
  // Any proprietary / IP context the applicant is disclosing (eg
  // "based on my own illustration, no third-party IP").
  ipDisclosure: string;

  status: LicenseStatus;

  // Admin review.
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNote?: string;

  // Fee payment.
  stripePaymentIntentId?: string;
  feePaidAt?: string;
  feeAmountCents?: number;

  // Click-signed documents.
  licenseAgreement?: LicenseAgreementDoc;
  nda?: LicenseAgreementDoc;

  // Commission tier state.
  commissionRate: number; // starts at TIER 1, upgrades automatically.
  unitsSold: number;
  grossRevenueCents: number;
  payoutOwedCents: number;

  createdAt: string;
  updatedAt: string;
}

export interface LicenseSale {
  _id?: ObjectId;
  id: string;
  licenseId: string;
  orderId: string;          // from the main orders system
  playerId: string;         // the designer earning commission
  grossCents: number;       // sale price before fees
  commissionRateApplied: number;
  commissionCents: number;
  createdAt: string;
  paidOutAt?: string;
}

export async function ensureLicensingIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<LicenseApplication>("licenseApplications").createIndex({ id: 1 }, { unique: true }),
    db.collection<LicenseApplication>("licenseApplications").createIndex({ playerId: 1, createdAt: -1 }),
    db.collection<LicenseApplication>("licenseApplications").createIndex({ status: 1, createdAt: -1 }),
    db.collection<LicenseSale>("licenseSales").createIndex({ licenseId: 1, createdAt: -1 }),
    db.collection<LicenseSale>("licenseSales").createIndex({ playerId: 1, paidOutAt: 1 }),
  ]);
}

/* ---------------------- Applications ---------------------- */

export async function createApplication(input: Omit<LicenseApplication, "_id" | "id" | "status" | "commissionRate" | "unitsSold" | "grossRevenueCents" | "payoutOwedCents" | "createdAt" | "updatedAt">): Promise<LicenseApplication> {
  const db = await getDb();
  const now = new Date().toISOString();
  const row: LicenseApplication = {
    ...input,
    id: `lic_${Date.now()}_${randomBytes(4).toString("hex")}`,
    status: "submitted",
    commissionRate: COMMISSION_TIER_1,
    unitsSold: 0,
    grossRevenueCents: 0,
    payoutOwedCents: 0,
    createdAt: now, updatedAt: now,
  };
  await db.collection<LicenseApplication>("licenseApplications").insertOne(row);
  return row;
}

export async function listApplications(filter?: { status?: LicenseStatus; playerId?: string }): Promise<LicenseApplication[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (filter?.status) q.status = filter.status;
  if (filter?.playerId) q.playerId = filter.playerId;
  return db.collection<LicenseApplication>("licenseApplications")
    .find(q, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(200).toArray();
}

export async function getApplication(id: string): Promise<LicenseApplication | null> {
  const db = await getDb();
  return db.collection<LicenseApplication>("licenseApplications").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateApplication(id: string, patch: Partial<LicenseApplication>): Promise<void> {
  const db = await getDb();
  await db.collection<LicenseApplication>("licenseApplications").updateOne(
    { id }, { $set: { ...patch, updatedAt: new Date().toISOString() } },
  );
}

/* ------------------------ Sales ---------------------------- */

export async function recordSale(opts: {
  licenseId: string;
  orderId: string;
  grossCents: number;
}): Promise<LicenseSale> {
  const db = await getDb();
  const lic = await getApplication(opts.licenseId);
  if (!lic) throw new Error("recordSale: license not found");
  // Tier upgrade: before computing commission, promote if we've just
  // crossed the 1,000-unit threshold.
  const newUnits = lic.unitsSold + 1;
  const rate = newUnits > TIER_UPGRADE_UNITS ? COMMISSION_TIER_2 : lic.commissionRate;
  const commissionCents = Math.round(opts.grossCents * rate);
  const row: LicenseSale = {
    id: `sale_${Date.now()}_${randomBytes(4).toString("hex")}`,
    licenseId: opts.licenseId,
    orderId: opts.orderId,
    playerId: lic.playerId,
    grossCents: opts.grossCents,
    commissionRateApplied: rate,
    commissionCents,
    createdAt: new Date().toISOString(),
  };
  await db.collection<LicenseSale>("licenseSales").insertOne(row);
  await updateApplication(opts.licenseId, {
    commissionRate: rate,
    unitsSold: newUnits,
    grossRevenueCents: lic.grossRevenueCents + opts.grossCents,
    payoutOwedCents: lic.payoutOwedCents + commissionCents,
  });
  return row;
}
