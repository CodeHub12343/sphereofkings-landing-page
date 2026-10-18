"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getQuote, updateQuoteState } from "@/lib/store/quotes-store";
import { QuoteState, QUOTE_STATE_META } from "@/lib/sample-quotes";
import {
  computeReservationExpiry,
  generateCheckoutToken,
  wholesaleCheckoutPath,
} from "@/lib/wholesale-checkout";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { sendEmail } from "@/lib/email/send";
import WholesaleDecisionEmail from "@/components/emails/WholesaleDecision";
import { createElement } from "react";
import { adjustReservedUnits } from "@/lib/db/collections/products";

export type DecisionResult =
  | { ok: true; ref: string; state: QuoteState; checkoutToken?: string }
  | { ok: false; error: string };

export async function decideQuoteAction(
  ref: string,
  decision: QuoteState,
  note?: string,
): Promise<DecisionResult> {
  const current = await getQuote(ref);
  if (!current) return { ok: false, error: "Quote not found." };

  // Approve → generate (or reuse) a checkout token and a reservation
  // window. Other state transitions clear the reservation if one existed.
  const patch: Partial<Awaited<ReturnType<typeof getQuote>>> = {
    decisionNote: note,
  };
  if (decision === "approved") {
    patch.checkoutToken = current.checkoutToken ?? generateCheckoutToken();
    patch.reservationExpiresISO = computeReservationExpiry();
  } else {
    // On any non-approve, drop the token so an old link stops working.
    patch.checkoutToken = undefined;
    patch.reservationExpiresISO = undefined;
  }

  const next = await updateQuoteState(ref, decision, patch);
  if (!next) return { ok: false, error: "Could not update quote." };

  // Stock reservation side-effects:
  //   previously approved + now approved  → leave reservation as-is
  //   not approved + now approved          → reserve each line's qty
  //   previously approved + now NOT        → release each line's qty
  // Reservations are released by payment-confirmed via the checkout
  // action (markQuoteConsumed) too, which runs before the webhook so
  // the moving-to-unitsSold step is clean.
  const wasApproved = current.state === "approved" && !current.tokenConsumedISO;
  const nowApproved = decision === "approved";
  if (!wasApproved && nowApproved) {
    for (const l of current.lines) {
      await adjustReservedUnits(l.productSlug, l.qty).catch(() => {});
    }
  } else if (wasApproved && !nowApproved) {
    for (const l of current.lines) {
      await adjustReservedUnits(l.productSlug, -l.qty).catch(() => {});
    }
  }

  // Audit the decision. Advisory — never blocks the state change.
  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "quote.decide",
    target: { collection: "quotes", id: next.ref },
    summary: `${QUOTE_STATE_META[current.state].label} → ${QUOTE_STATE_META[decision].label}`,
    details: {
      from: current.state,
      to: decision,
      business: current.business,
      note: note ?? null,
      checkoutToken: patch.checkoutToken ?? null,
      reservationExpiresISO: patch.reservationExpiresISO ?? null,
    },
  });

  // Fire the decision email for the four states the buyer should hear
  // about. Non-blocking — a mail failure never undoes the state change,
  // we just surface it in the audit log so the operator knows to follow
  // up out of band.
  const emailable: QuoteState[] = [
    "approved",
    "declined",
    "counteroffer",
    "info-required",
  ];
  let emailResult: Awaited<ReturnType<typeof sendEmail>> | null = null;
  if (emailable.includes(decision) && current.email) {
    const origin = await buildOrigin();
    const checkoutUrl =
      decision === "approved" && next.checkoutToken
        ? `${origin}${wholesaleCheckoutPath(next.checkoutToken)}`
        : undefined;
    const reservationExpires =
      decision === "approved" && next.reservationExpiresISO
        ? new Date(next.reservationExpiresISO).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "UTC",
          }) + " UTC"
        : undefined;
    emailResult = await sendEmail({
      to: current.email,
      subject: subjectFor(decision, next.ref),
      react: createElement(WholesaleDecisionEmail, {
        contactName: current.contactName,
        business: current.business,
        ref: next.ref,
        lines: current.lines.map((l) => ({
          productName: l.productName,
          qty: l.qty,
        })),
        decision: decision as
          | "approved"
          | "declined"
          | "counteroffer"
          | "info-required",
        note,
        checkoutUrl,
        reservationExpires,
      }),
    }).catch(
      (e) => ({ ok: false, reason: (e as Error).message } as const),
    );
    await recordAuditEvent({
      actor,
      action: emailResult.ok ? "quote.email.sent" : "quote.email.failed",
      target: { collection: "quotes", id: next.ref },
      summary: emailResult.ok
        ? `Decision email sent to ${current.email}`
        : `Decision email NOT sent: ${emailResult.reason}`,
      details: {
        decision,
        to: current.email,
        resendId: emailResult.ok ? emailResult.id : null,
        reason: emailResult.ok ? null : emailResult.reason,
      },
    }).catch(() => {});
  }

  revalidatePath("/admin/wholesale");
  revalidatePath("/admin/audit");
  return {
    ok: true,
    ref: next.ref,
    state: next.state,
    checkoutToken: next.checkoutToken,
  };
}

function subjectFor(decision: QuoteState, ref: string): string {
  if (decision === "approved")
    return `Your wholesale quote ${ref} is approved — one-click checkout inside`;
  if (decision === "declined")
    return `Update on your wholesale inquiry ${ref}`;
  if (decision === "counteroffer")
    return `A counteroffer for wholesale ${ref}`;
  return `A quick question about your wholesale inquiry ${ref}`;
}

async function buildOrigin(): Promise<string> {
  // Build the absolute URL for the checkout link. Honours
  // NEXT_PUBLIC_SITE_URL in prod, else reconstructs from the Host
  // header the admin request came in on.
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
