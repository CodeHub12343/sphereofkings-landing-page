"use server";

import { createElement } from "react";
import { sendEmail } from "@/lib/email/send";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import LaunchAnnouncement from "@/components/emails/LaunchAnnouncement";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";
import DispatchNotice from "@/components/emails/DispatchNotice";
import AffiliatePayoutStatement from "@/components/emails/AffiliatePayoutStatement";

export type EmailTemplate = "launch" | "order" | "dispatch" | "payout";

export type SendTestResult =
  | { ok: true; id: string; to: string }
  | { ok: false; error: string };

const SUBJECTS: Record<EmailTemplate, string> = {
  launch: "[TEST] Christmas Early Bird preorders are open — Sphere of Kings",
  order: "[TEST] Order confirmed · Sphere of Kings",
  dispatch: "[TEST] Your Sphere is on its way · Sphere of Kings",
  payout: "[TEST] Your earnings statement · Sphere of Kings affiliate",
};

export async function sendTestEmailAction(
  template: EmailTemplate,
  to: string,
): Promise<SendTestResult> {
  if (!/.+@.+\..+/.test(to)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const subject = SUBJECTS[template];
  if (!subject) return { ok: false, error: "Unknown template." };

  const react = sampleFor(template);
  const result = await sendEmail({ to, subject, react }).catch(
    (e) => ({ ok: false, reason: (e as Error).message } as const),
  );

  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: result.ok ? "email.test.sent" : "email.test.failed",
    target: { collection: "emails", id: template },
    summary: result.ok
      ? `Sent ${template} test to ${to}`
      : `Test ${template} NOT sent to ${to}: ${result.reason}`,
    details: {
      template,
      to,
      resendId: result.ok ? result.id : null,
      reason: result.ok ? null : result.reason,
    },
  }).catch(() => {});

  if (!result.ok) return { ok: false, error: result.reason };
  return { ok: true, id: result.id, to };
}

function sampleFor(template: EmailTemplate) {
  switch (template) {
    case "launch":
      return createElement(LaunchAnnouncement, { firstName: "Marion" });
    case "order":
      return createElement(OrderConfirmationEmail, {
        firstName: "Marion",
        orderRef: "SOK-TEST-001",
        lines: [
          { name: "Complete 7-in-1", qty: 1, totalDisplay: "$179.00" },
          { name: "Royal Checkers refill", qty: 2, totalDisplay: "$158.00" },
        ],
        subtotalDisplay: "$337.00",
        shippingDisplay: "$—",
        taxDisplay: "$—",
        totalDisplay: "$337.00",
        shipTo:
          "Marion Clarke\n12 Grove Lane, Flat 3\nLondon SW1A 1AA\nUnited Kingdom",
        affiliateCode: "POSTER-247",
      });
    case "dispatch":
      return createElement(DispatchNotice, {
        firstName: "Marion",
        orderRef: "SOK-TEST-001",
        carrier: "DHL Express",
        trackingNumber: "1Z999AA10123456784",
        trackingUrl: "https://www.dhl.com/track",
        itemsSummary: "1 × Complete 7-in-1 and 2 × Royal Checkers refill",
        shipTo:
          "Marion Clarke\n12 Grove Lane, Flat 3\nLondon SW1A 1AA\nUnited Kingdom",
      });
    case "payout":
      return createElement(AffiliatePayoutStatement, {
        firstName: "Benjamin",
        code: "POSTER-247",
        periodLabel: "September 2026",
        tierName: "Gold",
        tierRate: 15,
        approvedCount: 176,
        payoutDisplay: "$2,640.00",
        payoutMethod: "Bank transfer · test send",
        lines: [
          {
            dateDisplay: "Sep 28",
            orderRef: "SOK-004218",
            type: "approved",
            commissionDisplay: "$26.85",
          },
          {
            dateDisplay: "Sep 27",
            orderRef: "SOK-004210",
            type: "approved",
            commissionDisplay: "$33.75",
          },
          {
            dateDisplay: "Sep 24",
            orderRef: "SOK-004193",
            type: "refunded",
            commissionDisplay: "− $26.85",
          },
          {
            dateDisplay: "Sep 22",
            orderRef: "SOK-004177",
            type: "cancelled",
            commissionDisplay: "$—",
          },
        ],
      });
  }
}
