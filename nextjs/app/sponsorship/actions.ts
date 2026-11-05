"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  countOccupiedByTier,
  createPendingSponsorship,
  findSponsorshipByRef,
  StoredSponsorship,
  updateSponsorshipPayment,
} from "@/lib/db/collections/sponsorships";
import { addWaitlistEntry } from "@/lib/db/collections/sponsorship-waitlist";
import { getStripe, hasStripe, publishableKey } from "@/lib/stripe/server";
import {
  SponsorshipTierId,
  isTierId,
  tier as tierOf,
} from "@/lib/sponsorship";
import { sendEmail } from "@/lib/email/send";
import SponsorshipWaitlistEmail from "@/components/emails/SponsorshipWaitlistEmail";
import SponsorshipPendingEmail from "@/components/emails/SponsorshipPendingEmail";

export type AvailabilityByTier = {
  silver: { total: number; occupied: number; remaining: number };
  gold: { total: number; occupied: number; remaining: number };
};

export async function getSponsorshipAvailability(): Promise<AvailabilityByTier> {
  const silverOcc = await countOccupiedByTier("silver");
  const goldOcc = await countOccupiedByTier("gold");
  const silver = tierOf("silver");
  const gold = tierOf("gold");
  return {
    silver: {
      total: silver.totalSlots,
      occupied: silverOcc,
      remaining: Math.max(0, silver.totalSlots - silverOcc),
    },
    gold: {
      total: gold.totalSlots,
      occupied: goldOcc,
      remaining: Math.max(0, gold.totalSlots - goldOcc),
    },
  };
}

/* ---------------------- Business reservation ---------------------- */

export type SponsorshipDraftInput = {
  tier: SponsorshipTierId;
  businessName: string;
  businessWebsite?: string;
  businessCategory?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  notes?: string;
};

export type ReserveSponsorshipResult =
  | { ok: true; ref: string }
  | { ok: false; reason: "sold-out"; tier: SponsorshipTierId }
  | { ok: false; reason: "validation"; message: string }
  | { ok: false; reason: "server-error" };

function cleanStr(x: unknown, max = 240): string {
  if (typeof x !== "string") return "";
  return x.trim().slice(0, max);
}

function validEmail(x: string): boolean {
  return /.+@.+\..+/.test(x);
}

export async function reserveSponsorshipAction(
  input: SponsorshipDraftInput,
): Promise<ReserveSponsorshipResult> {
  if (!isTierId(input.tier)) {
    return { ok: false, reason: "validation", message: "Pick a sponsorship tier." };
  }
  const t = tierOf(input.tier);

  const businessName = cleanStr(input.businessName, 180);
  const contactName = cleanStr(input.contactName, 180);
  const contactEmail = cleanStr(input.contactEmail, 180);
  const businessWebsite = cleanStr(input.businessWebsite, 240) || undefined;
  const businessCategory = cleanStr(input.businessCategory, 120) || undefined;
  const contactPhone = cleanStr(input.contactPhone, 60) || undefined;
  const notes = cleanStr(input.notes, 2000) || undefined;

  if (!businessName)
    return { ok: false, reason: "validation", message: "Enter the business name." };
  if (!contactName)
    return { ok: false, reason: "validation", message: "Enter the contact name." };
  if (!validEmail(contactEmail))
    return { ok: false, reason: "validation", message: "Enter a valid email address." };

  // Re-check availability inside the action so a slow-filling form can't
  // over-sell. If the last slot was taken while the shopper was typing
  // we return sold-out and the UI switches to the waitlist CTA.
  const occupied = await countOccupiedByTier(input.tier);
  if (occupied >= t.totalSlots) {
    return { ok: false, reason: "sold-out", tier: input.tier };
  }

  try {
    const row = await createPendingSponsorship({
      tier: input.tier,
      priceMinor: t.priceMinor,
      businessName,
      businessWebsite,
      businessCategory,
      contactName,
      contactEmail: contactEmail.toLowerCase(),
      contactPhone,
      notes,
    });
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "sponsorship.reserved",
      target: { collection: "sponsorships", id: row.ref },
      summary: `Sponsorship ${t.name} reserved by ${businessName}`,
      details: { tier: input.tier, contactEmail, priceMinor: t.priceMinor },
    }).catch(() => {});

    // Owner heads-up email so James can follow up personally even if
    // the shopper abandons at payment. Non-blocking.
    const ownerEmail = process.env.SPONSORSHIP_NOTIFY_EMAIL;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `New sponsorship reservation · ${t.name} · ${businessName}`,
        react: createElement(SponsorshipPendingEmail, {
          tierName: t.name,
          priceDisplay: t.priceDisplay,
          businessName,
          contactName,
          contactEmail,
          contactPhone,
          businessWebsite,
          notes,
          ref: row.ref,
        }),
        replyTo: contactEmail,
      }).catch(() => {});
    }

    revalidatePath("/sponsorship");
    revalidatePath("/admin/sponsorships");
    return { ok: true, ref: row.ref };
  } catch {
    return { ok: false, reason: "server-error" };
  }
}

/* ----------------------- Stripe payment --------------------------- */

export type SponsorshipPaymentResult =
  | {
      ok: true;
      clientSecret: string;
      publishableKey: string;
      amountMinor: number;
      ref: string;
    }
  | { ok: false; reason: "stripe-not-wired" }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "already-paid" }
  | { ok: false; reason: "server-error"; message: string };

export async function createSponsorshipPaymentIntentAction(
  ref: string,
): Promise<SponsorshipPaymentResult> {
  if (!hasStripe()) return { ok: false, reason: "stripe-not-wired" };
  const key = publishableKey();
  if (!key) return { ok: false, reason: "stripe-not-wired" };

  const row = await findSponsorshipByRef(ref);
  if (!row) return { ok: false, reason: "not-found" };
  if (row.state === "paid") return { ok: false, reason: "already-paid" };

  try {
    const stripe = await getStripe();
    if (!stripe) return { ok: false, reason: "stripe-not-wired" };

    const t = tierOf(row.tier);
    let intent;
    if (row.stripePaymentIntentId) {
      try {
        intent = await stripe.paymentIntents.retrieve(row.stripePaymentIntentId);
        if (intent.status === "succeeded" || intent.status === "canceled") {
          intent = undefined;
        }
      } catch {
        intent = undefined;
      }
    }
    if (!intent) {
      intent = await stripe.paymentIntents.create({
        amount: row.priceMinor,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          kind: "sponsorship",
          sponsorshipRef: row.ref,
          tier: row.tier,
          businessName: row.businessName.slice(0, 500),
        },
        description: `Sphere of Kings · ${t.name} · ${row.ref}`,
        receipt_email: row.contactEmail || undefined,
      });
    } else if (intent.amount !== row.priceMinor) {
      intent = await stripe.paymentIntents.update(intent.id, {
        amount: row.priceMinor,
      });
    }

    await updateSponsorshipPayment(row.ref, "pending", {
      stripePaymentIntentId: intent.id,
    });

    return {
      ok: true,
      clientSecret: intent.client_secret ?? "",
      publishableKey: key,
      amountMinor: row.priceMinor,
      ref: row.ref,
    };
  } catch (err) {
    return {
      ok: false,
      reason: "server-error",
      message: err instanceof Error ? err.message : "Unknown Stripe error.",
    };
  }
}

export async function fetchSponsorshipAction(
  ref: string,
): Promise<{ ok: true; row: StoredSponsorship } | { ok: false }> {
  const row = await findSponsorshipByRef(ref);
  if (!row) return { ok: false };
  return { ok: true, row };
}

/* --------------------------- Waitlist ----------------------------- */

export type WaitlistInput = {
  tier: SponsorshipTierId;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  businessWebsite?: string;
  notes?: string;
};

export type WaitlistResult =
  | { ok: true }
  | { ok: false; message: string };

export async function joinWaitlistAction(
  input: WaitlistInput,
): Promise<WaitlistResult> {
  if (!isTierId(input.tier)) {
    return { ok: false, message: "Pick a sponsorship tier first." };
  }
  const t = tierOf(input.tier);
  const businessName = cleanStr(input.businessName, 180);
  const contactName = cleanStr(input.contactName, 180);
  const contactEmail = cleanStr(input.contactEmail, 180);
  if (!businessName) return { ok: false, message: "Enter the business name." };
  if (!contactName) return { ok: false, message: "Enter a contact name." };
  if (!validEmail(contactEmail))
    return { ok: false, message: "Enter a valid email address." };

  try {
    await addWaitlistEntry({
      tier: input.tier,
      businessName,
      contactName,
      contactEmail,
      contactPhone: cleanStr(input.contactPhone, 60) || undefined,
      businessWebsite: cleanStr(input.businessWebsite, 240) || undefined,
      notes: cleanStr(input.notes, 2000) || undefined,
    });
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "sponsorship.waitlist.joined",
      target: { collection: "sponsorship_waitlist", id: contactEmail },
      summary: `Waitlist signup — ${t.name} — ${businessName}`,
      details: { tier: input.tier, contactEmail },
    }).catch(() => {});

    // Confirmation email to the signer-upper so they have proof of
    // signup and know what happens next.
    await sendEmail({
      to: contactEmail,
      subject: `You're on the list · ${t.name} · Sphere of Kings`,
      react: createElement(SponsorshipWaitlistEmail, {
        tierName: t.name,
        tierPriceDisplay: t.priceDisplay,
        contactName,
        businessName,
      }),
    }).catch(() => {});

    // Owner heads-up email.
    const ownerEmail = process.env.SPONSORSHIP_NOTIFY_EMAIL;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `Waitlist signup · ${t.name} · ${businessName}`,
        html: `<p>Waitlist signup for <strong>${t.name}</strong> (${t.priceDisplay}).</p>
        <p><strong>Business:</strong> ${businessName}<br/>
        <strong>Contact:</strong> ${contactName} &lt;${contactEmail}&gt;<br/>
        ${input.contactPhone ? `<strong>Phone:</strong> ${input.contactPhone}<br/>` : ""}
        ${input.businessWebsite ? `<strong>Website:</strong> ${input.businessWebsite}<br/>` : ""}
        ${input.notes ? `<strong>Notes:</strong><br/>${input.notes.replace(/</g, "&lt;")}` : ""}</p>`,
        replyTo: contactEmail,
      }).catch(() => {});
    }

    revalidatePath("/admin/sponsorships");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not save your signup. Please try again." };
  }
}

/* ---------------- Investment Partners inquiry --------------------- */

export type InvestorInquiryInput = {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  organization?: string;
  website?: string;
  investmentRange: string;
  accredited?: string;
  timeline?: string;
  notes?: string;
};

export type InvestorInquiryResult =
  | { ok: true }
  | { ok: false; message: string };

export async function requestInvestorInfoAction(
  input: InvestorInquiryInput,
): Promise<InvestorInquiryResult> {
  const contactName = cleanStr(input.contactName, 180);
  const contactEmail = cleanStr(input.contactEmail, 180).toLowerCase();
  const contactPhone = cleanStr(input.contactPhone, 60) || undefined;
  const organization = cleanStr(input.organization, 180) || undefined;
  const website = cleanStr(input.website, 240) || undefined;
  const investmentRange = cleanStr(input.investmentRange, 80);
  const accredited = cleanStr(input.accredited, 40) || undefined;
  const timeline = cleanStr(input.timeline, 120) || undefined;
  const notes = cleanStr(input.notes, 4000) || undefined;

  if (!contactName) return { ok: false, message: "Enter your name." };
  if (!validEmail(contactEmail))
    return { ok: false, message: "Enter a valid email address." };
  if (!investmentRange)
    return { ok: false, message: "Pick an investment range so we can route this." };

  try {
    await recordAuditEvent({
      actor: { kind: "system" },
      action: "sponsorship.investor_inquiry",
      target: { collection: "sponsorships", id: contactEmail },
      summary: `Investor inquiry — ${organization || contactName} — ${investmentRange}`,
      details: {
        contactEmail,
        organization,
        investmentRange,
        accredited,
        timeline,
      },
    }).catch(() => {});

    const ownerEmail = process.env.SPONSORSHIP_NOTIFY_EMAIL;
    if (ownerEmail) {
      const esc = (s: string) => s.replace(/[&<>]/g, (c) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
      );
      await sendEmail({
        to: ownerEmail,
        subject: `Investment Partners inquiry · ${investmentRange} · ${organization || contactName}`,
        html: `<p>New Investment Partners portal inquiry.</p>
          <p>
            <strong>Name:</strong> ${esc(contactName)}<br/>
            <strong>Email:</strong> ${esc(contactEmail)}<br/>
            ${contactPhone ? `<strong>Phone:</strong> ${esc(contactPhone)}<br/>` : ""}
            ${organization ? `<strong>Organization:</strong> ${esc(organization)}<br/>` : ""}
            ${website ? `<strong>Website:</strong> ${esc(website)}<br/>` : ""}
            <strong>Investment range:</strong> ${esc(investmentRange)}<br/>
            ${accredited ? `<strong>Accredited:</strong> ${esc(accredited)}<br/>` : ""}
            ${timeline ? `<strong>Timeline:</strong> ${esc(timeline)}<br/>` : ""}
          </p>
          ${notes ? `<p><strong>Notes:</strong><br/>${esc(notes).replace(/\n/g, "<br/>")}</p>` : ""}
          <p style="color:#888;font-size:12px">Reply to this email to contact the prospect directly.</p>`,
        replyTo: contactEmail,
      }).catch(() => {});
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Could not submit your inquiry. Please try again or email us directly.",
    };
  }
}
