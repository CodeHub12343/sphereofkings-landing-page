"use server";

import { randomBytes } from "node:crypto";
import { createElement } from "react";
import { revalidatePath } from "next/cache";
import {
  addSponsorshipActivity,
  findSponsorshipByRef,
  removeSponsorshipActivity,
  setCampaignStart,
  SponsorshipActivity,
  SponsorshipActivityKind,
  setMagicLink,
} from "@/lib/db/collections/sponsorships";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { sendEmail } from "@/lib/email/send";
import SponsorMagicLinkEmail from "@/components/emails/SponsorMagicLinkEmail";
import { tier as tierOf } from "@/lib/sponsorship";

export type ActivityInput = {
  ref: string;
  kind: SponsorshipActivityKind;
  summary: string;
  url?: string;
  channel?: string;
  publishedISO?: string;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

const VALID_KINDS: SponsorshipActivityKind[] = [
  "shoutout",
  "video",
  "boosted-post",
  "appreciation-post",
  "spotlight",
  "dedicated-video",
  "report",
  "note",
];

function siteOrigin(): string {
  const u = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return u || "http://localhost:3000";
}

export async function logSponsorshipActivityAction(
  input: ActivityInput,
): Promise<ActionResult> {
  if (!VALID_KINDS.includes(input.kind)) {
    return { ok: false, message: "Unknown activity type." };
  }
  const summary = (input.summary || "").trim().slice(0, 500);
  if (!summary) return { ok: false, message: "Describe what was delivered." };

  const row = await findSponsorshipByRef(input.ref);
  if (!row) return { ok: false, message: "Sponsorship not found." };

  const activity: SponsorshipActivity = {
    id: randomBytes(6).toString("hex"),
    kind: input.kind,
    summary,
    url: input.url ? input.url.trim().slice(0, 500) || undefined : undefined,
    channel: input.channel
      ? input.channel.trim().slice(0, 120) || undefined
      : undefined,
    publishedISO: input.publishedISO || new Date().toISOString(),
    createdISO: new Date().toISOString(),
  };

  await addSponsorshipActivity(row.ref, activity);
  await recordAuditEvent({
    actor: { kind: "admin-session" },
    action: "sponsorship.activity.logged",
    target: { collection: "sponsorships", id: row.ref },
    summary: `Activity ${activity.kind} logged on ${row.ref}`,
    details: { ...activity },
  }).catch(() => {});
  revalidatePath(`/admin/sponsorships/${row.ref}`);
  revalidatePath("/sponsor");
  return { ok: true };
}

export async function removeSponsorshipActivityAction(input: {
  ref: string;
  activityId: string;
}): Promise<ActionResult> {
  const row = await findSponsorshipByRef(input.ref);
  if (!row) return { ok: false, message: "Sponsorship not found." };
  await removeSponsorshipActivity(row.ref, input.activityId);
  await recordAuditEvent({
    actor: { kind: "admin-session" },
    action: "sponsorship.activity.removed",
    target: { collection: "sponsorships", id: row.ref },
    summary: `Activity ${input.activityId} removed from ${row.ref}`,
    details: { activityId: input.activityId },
  }).catch(() => {});
  revalidatePath(`/admin/sponsorships/${row.ref}`);
  revalidatePath("/sponsor");
  return { ok: true };
}

export async function setCampaignStartAction(input: {
  ref: string;
  startISO: string;
}): Promise<ActionResult> {
  const row = await findSponsorshipByRef(input.ref);
  if (!row) return { ok: false, message: "Sponsorship not found." };
  // Guard: input must parse as a date.
  const d = new Date(input.startISO);
  if (Number.isNaN(d.getTime())) {
    return { ok: false, message: "Invalid date." };
  }
  await setCampaignStart(row.ref, d.toISOString());
  await recordAuditEvent({
    actor: { kind: "admin-session" },
    action: "sponsorship.campaignStart.updated",
    target: { collection: "sponsorships", id: row.ref },
    summary: `Campaign start reset to ${d.toISOString()} on ${row.ref}`,
    details: { startISO: d.toISOString() },
  }).catch(() => {});
  revalidatePath(`/admin/sponsorships/${row.ref}`);
  revalidatePath("/sponsor");
  return { ok: true };
}

// Admin convenience: force a magic-link email to the sponsor contact.
// Used when the sponsor can't find the original link or their inbox
// filtered it. Mints a fresh token with the normal 30-minute TTL.
export async function sendSponsorMagicLinkAction(input: {
  ref: string;
}): Promise<ActionResult> {
  const row = await findSponsorshipByRef(input.ref);
  if (!row) return { ok: false, message: "Sponsorship not found." };
  if (row.state !== "paid")
    return { ok: false, message: "Sponsorship must be paid to issue a link." };
  const token = randomBytes(32).toString("hex");
  const expiresISO = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await setMagicLink(row.ref, { token, expiresISO });
  const linkUrl = `${siteOrigin()}/sponsor/signin/${token}`;
  const t = tierOf(row.tier);
  await sendEmail({
    to: row.contactEmail,
    subject: "Your Sphere of Kings sponsor sign-in link",
    react: createElement(SponsorMagicLinkEmail, {
      contactName: row.contactName,
      businessName: row.businessName,
      tierName: t.name,
      linkUrl,
      ttlMinutes: 30,
    }),
  }).catch(() => {});
  await recordAuditEvent({
    actor: { kind: "admin-session" },
    action: "sponsor.magicLink.sentByAdmin",
    target: { collection: "sponsorships", id: row.ref },
    summary: `Admin issued magic link to ${row.contactEmail}`,
    details: { ref: row.ref },
  }).catch(() => {});
  return { ok: true };
}
