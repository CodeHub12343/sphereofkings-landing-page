"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import {
  getApplication, updateApplication, SUBMISSION_FEE_CENTS,
} from "@/lib/db/collections/licensing";
import { sendEmail } from "@/lib/email/send";

async function requireAdmin() {
  const jar = await cookies();
  const a = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!a) throw new Error("admin only");
  return a;
}

export async function approveApplicationAction(opts: { applicationId: string; note?: string }) {
  let admin;
  try { admin = await requireAdmin(); } catch { return { error: "Admin sign-in required." }; }

  const app = await getApplication(opts.applicationId);
  if (!app) return { error: "Not found." };
  if (!(app.status === "submitted" || app.status === "under-review")) {
    return { error: `Cannot approve from status "${app.status}".` };
  }

  // Create a Stripe PaymentIntent for the submission fee. The applicant
  // completes payment via the client secret emailed to them.
  const key = process.env.STRIPE_SECRET_KEY;
  let paymentIntentId: string | undefined;
  let clientSecret: string | undefined;
  if (key) {
    const stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion });
    const intent = await stripe.paymentIntents.create({
      amount: SUBMISSION_FEE_CENTS,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      description: `Sphere of Kings license submission fee — ${app.title}`,
      metadata: {
        kind: "license-submission-fee",
        applicationId: app.id,
        playerId: app.playerId,
      },
      receipt_email: app.playerEmail,
    });
    paymentIntentId = intent.id;
    clientSecret = intent.client_secret ?? undefined;
  }

  await updateApplication(app.id, {
    status: "approved-fee-pending",
    reviewedByAdminId: admin.id,
    reviewedAt: new Date().toISOString(),
    reviewNote: opts.note,
    stripePaymentIntentId: paymentIntentId,
    feeAmountCents: SUBMISSION_FEE_CENTS,
  });

  // Email the applicant with payment instructions.
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sphereofkings.com";
    await sendEmail({
      to: app.playerEmail,
      subject: `Your Sphere of Kings license application has been approved`,
      html: `
        <p>Hi ${app.playerDisplayName},</p>
        <p>Great news — your license application for <strong>${app.title}</strong>
        has been approved by our review team.</p>
        <p>To move forward, please complete the one-time
        <strong>$${(SUBMISSION_FEE_CENTS / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })} USD</strong>
        submission fee at <a href="${origin}/me/license">${origin}/me/license</a>.
        Once paid, you'll be prompted to click-sign the license agreement and NDA,
        after which your design will be set up for production.</p>
        ${opts.note ? `<p><strong>Reviewer note:</strong> ${opts.note}</p>` : ""}
        <p>Thank you for creating with Sphere of Kings.</p>
      `,
    });
  } catch (err) {
    console.warn("approve email failed:", err instanceof Error ? err.message : err);
  }

  revalidatePath("/admin/license-applications");
  return { ok: true };
}

export async function rejectApplicationAction(opts: { applicationId: string; note?: string }) {
  let admin;
  try { admin = await requireAdmin(); } catch { return { error: "Admin sign-in required." }; }
  const app = await getApplication(opts.applicationId);
  if (!app) return { error: "Not found." };
  await updateApplication(app.id, {
    status: "rejected",
    reviewedByAdminId: admin.id,
    reviewedAt: new Date().toISOString(),
    reviewNote: opts.note,
  });
  try {
    await sendEmail({
      to: app.playerEmail,
      subject: `Update on your Sphere of Kings license application`,
      html: `
        <p>Hi ${app.playerDisplayName},</p>
        <p>Thank you for applying to license <strong>${app.title}</strong> through
        Sphere of Kings. After careful review, we're not able to move forward with
        this submission at this time.</p>
        ${opts.note ? `<p><strong>Reviewer note:</strong> ${opts.note}</p>` : ""}
        <p>You're welcome to apply again with a different design in the future.</p>
      `,
    });
  } catch {}
  revalidatePath("/admin/license-applications");
  return { ok: true };
}
