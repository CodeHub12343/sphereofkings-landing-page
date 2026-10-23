"use server";

import { revalidatePath } from "next/cache";
import { createElement } from "react";
import { currentAdminActor } from "@/lib/auth/current-actor";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  findWithdrawalRequestById,
  updateWithdrawalRequest,
} from "@/lib/db/collections/withdrawal-requests";
import {
  findAffiliateByCode,
  updateAffiliate,
} from "@/lib/db/collections/affiliates";
import {
  listAttributionsByOrderRef,
  markAttributionsPaidOutForRequest,
  unlockAttributionsFromRequest,
} from "@/lib/db/collections/attributed-orders";
import { sendEmail } from "@/lib/email/send";
import AffiliatePayoutStatement from "@/components/emails/AffiliatePayoutStatement";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function approveWithdrawalAction(
  id: string,
  note?: string,
): Promise<ActionResult> {
  const actor = await currentAdminActor();
  const req = await findWithdrawalRequestById(id);
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== "pending") {
    return { ok: false, error: `Request is already ${req.status}.` };
  }
  const now = new Date().toISOString();
  await updateWithdrawalRequest(id, {
    status: "approved",
    decisionAdminId: actor.id,
    decisionAdminLabel: actor.label,
    decisionISO: now,
    adminNote: note?.trim() || undefined,
  });
  await recordAuditEvent({
    actor,
    action: "withdrawal.approved",
    target: { collection: "withdrawal_requests", id },
    summary: `Approved $${(req.amountMinor / 100).toFixed(2)} for ${req.affiliateCode}`,
    details: { amountMinor: req.amountMinor, orderCount: req.orderRefs.length },
  }).catch(() => {});
  revalidatePath("/admin/affiliates/requests");
  revalidatePath(`/admin/affiliates/requests/${id}`);
  revalidatePath("/affiliate");
  return { ok: true, message: "Request approved. Pay the affiliate out-of-band and mark completed when done." };
}

export async function rejectWithdrawalAction(
  id: string,
  reason: string,
): Promise<ActionResult> {
  const trimmed = (reason ?? "").trim();
  if (trimmed.length < 4) {
    return { ok: false, error: "Give a short reason (visible to the affiliate)." };
  }
  const actor = await currentAdminActor();
  const req = await findWithdrawalRequestById(id);
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== "pending" && req.status !== "approved") {
    return { ok: false, error: `Can't reject a ${req.status} request.` };
  }
  const now = new Date().toISOString();
  const unlocked = await unlockAttributionsFromRequest(id);
  await updateWithdrawalRequest(id, {
    status: "rejected",
    decisionAdminId: actor.id,
    decisionAdminLabel: actor.label,
    decisionISO: now,
    rejectReason: trimmed,
  });
  await recordAuditEvent({
    actor,
    action: "withdrawal.rejected",
    target: { collection: "withdrawal_requests", id },
    summary: `Rejected $${(req.amountMinor / 100).toFixed(2)} for ${req.affiliateCode}: ${trimmed}`,
    details: { amountMinor: req.amountMinor, reason: trimmed, unlockedOrders: unlocked },
  }).catch(() => {});
  revalidatePath("/admin/affiliates/requests");
  revalidatePath(`/admin/affiliates/requests/${id}`);
  revalidatePath("/affiliate");
  return { ok: true, message: `Rejected. ${unlocked} orders released back to the affiliate's balance.` };
}

export async function completeWithdrawalAction(
  id: string,
  reference: string,
  note?: string,
): Promise<ActionResult> {
  const trimmedRef = (reference ?? "").trim();
  if (trimmedRef.length < 2) {
    return {
      ok: false,
      error: "Enter the payment reference / transfer ID so the audit log can trace this.",
    };
  }
  const actor = await currentAdminActor();
  const req = await findWithdrawalRequestById(id);
  if (!req) return { ok: false, error: "Request not found." };
  if (req.status !== "approved" && req.status !== "pending") {
    return { ok: false, error: `Can't complete a ${req.status} request.` };
  }

  // Flip every attribution locked to the request to paid-out.
  const { orderRefs, totalPaidMinor } = await markAttributionsPaidOutForRequest(id, {
    method: req.payoutMethod,
    reference: trimmedRef,
    note: note?.trim() || undefined,
  });

  const now = new Date().toISOString();
  await updateWithdrawalRequest(id, {
    status: "completed",
    completedISO: now,
    completedReference: trimmedRef,
    adminNote: note?.trim() || req.adminNote,
    // Capture the decision timestamps if admin skipped the approve step.
    decisionAdminId: req.decisionAdminId ?? actor.id,
    decisionAdminLabel: req.decisionAdminLabel ?? actor.label,
    decisionISO: req.decisionISO ?? now,
  });

  // Bump paidOutCount on the affiliate record so admin tiles stay in sync.
  const aff = await findAffiliateByCode(req.affiliateCode);
  if (aff) {
    await updateAffiliate(aff.code, {
      paidOutCount: (aff.paidOutCount ?? 0) + orderRefs.length,
    });
  }

  // Fire the statement email. Non-blocking — never fails the state write.
  if (aff) {
    const lines: {
      orderRef: string;
      product: string;
      customer: string;
      placedISO: string;
      commissionDisplay: string;
    }[] = [];
    for (const ref of orderRefs) {
      const attrs = await listAttributionsByOrderRef(ref);
      const row = attrs.find((a) => a.affiliateCode === aff.code);
      const amount = row?.commissionAmountMinor ?? 0;
      lines.push({
        orderRef: ref,
        product: "—",
        customer: "—",
        placedISO: row?.placedISO ?? req.requestedISO,
        commissionDisplay: `$${(amount / 100).toFixed(2)}`,
      });
    }
    const methodLabel =
      req.payoutMethod === "bank"
        ? "Bank transfer"
        : req.payoutMethod === "wise"
          ? "Wise"
          : "PayPal";
    sendEmail({
      to: aff.email,
      subject: `Payout statement · ${orderRefs.length} order${orderRefs.length === 1 ? "" : "s"} · Sphere of Kings`,
      react: createElement(AffiliatePayoutStatement, {
        firstName: aff.firstName,
        affiliateCode: aff.code,
        approvedCount: orderRefs.length,
        payoutDisplay: `$${(totalPaidMinor / 100).toFixed(2)}`,
        payoutMethod: `${methodLabel} · ref ${trimmedRef}`,
        lines,
      }),
    })
      .then((r) => {
        recordAuditEvent({
          actor,
          action: r.ok
            ? "withdrawal.statement.sent"
            : "withdrawal.statement.failed",
          target: { collection: "withdrawal_requests", id },
          summary: r.ok
            ? `Payout statement emailed to ${aff.email}`
            : `Payout statement email failed: ${r.reason}`,
          details: { to: aff.email, reason: r.ok ? null : r.reason },
        }).catch(() => {});
      })
      .catch(() => {});
  }

  await recordAuditEvent({
    actor,
    action: "withdrawal.completed",
    target: { collection: "withdrawal_requests", id },
    summary: `Paid $${(totalPaidMinor / 100).toFixed(2)} to ${req.affiliateCode} (ref ${trimmedRef})`,
    details: {
      amountMinor: totalPaidMinor,
      orderCount: orderRefs.length,
      method: req.payoutMethod,
      reference: trimmedRef,
    },
  }).catch(() => {});

  revalidatePath("/admin/affiliates/requests");
  revalidatePath(`/admin/affiliates/requests/${id}`);
  revalidatePath("/admin/affiliates");
  revalidatePath("/affiliate");
  return {
    ok: true,
    message: `Marked completed. ${orderRefs.length} orders flipped to paid-out. Statement emailed to ${aff?.email ?? "the affiliate"}.`,
  };
}
