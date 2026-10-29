"use server";

import { randomBytes } from "node:crypto";
import { createElement } from "react";
import {
  findPaidSponsorshipByEmail,
  setMagicLink,
} from "@/lib/db/collections/sponsorships";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { sendEmail } from "@/lib/email/send";
import SponsorMagicLinkEmail from "@/components/emails/SponsorMagicLinkEmail";
import { tier as tierOf } from "@/lib/sponsorship";

// How long the magic link is valid. Short enough that a leaked email
// doesn't give infinite access; long enough that the sponsor can take
// their time clicking through from a different device.
const MAGIC_LINK_TTL_MINUTES = 30;

export type RequestLinkResult =
  // We intentionally return the same shape whether or not the email
  // matched a sponsorship — otherwise this becomes an "is this address a
  // sponsor?" oracle for anyone with a form.
  | { ok: true }
  | { ok: false; message: string };

function siteOrigin(): string {
  const u = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return u || "http://localhost:3000";
}

export async function requestSponsorMagicLinkAction(
  rawEmail: string,
): Promise<RequestLinkResult> {
  const email = (rawEmail || "").trim().toLowerCase();
  if (!/.+@.+\..+/.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const row = await findPaidSponsorshipByEmail(email);
  // Mint and deliver a link only when we actually have a match. In the
  // no-match case we still return ok:true so the UI doesn't leak which
  // emails are on file.
  if (row) {
    const token = randomBytes(32).toString("hex");
    const expiresISO = new Date(
      Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000,
    ).toISOString();
    await setMagicLink(row.ref, { token, expiresISO });

    const linkUrl = `${siteOrigin()}/sponsor/signin/${token}`;
    const t = tierOf(row.tier);
    await sendEmail({
      to: email,
      subject: `Your Sphere of Kings sponsor sign-in link`,
      react: createElement(SponsorMagicLinkEmail, {
        contactName: row.contactName,
        businessName: row.businessName,
        tierName: t.name,
        linkUrl,
        ttlMinutes: MAGIC_LINK_TTL_MINUTES,
      }),
    }).catch(() => {});
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "sponsor.magicLink.sent",
      target: { collection: "sponsorships", id: row.ref },
      summary: `Sponsor magic link sent to ${email}`,
      details: { ref: row.ref, ttlMinutes: MAGIC_LINK_TTL_MINUTES },
    }).catch(() => {});
  }

  return { ok: true };
}
