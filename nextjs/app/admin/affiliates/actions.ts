"use server";

import { revalidatePath } from "next/cache";
import {
  setAffiliateState,
  findAffiliateByCode,
  updateAffiliate,
} from "@/lib/db/collections/affiliates";
import { AffiliateState } from "@/lib/sample-affiliates";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { currentAdminActor } from "@/lib/auth/current-actor";
import {
  listAttributionsByOrderRef,
  markAllEligiblePaidOut,
  PayoutMethod,
} from "@/lib/db/collections/attributed-orders";
import { sendEmail } from "@/lib/email/send";
import AffiliatePayoutStatement from "@/components/emails/AffiliatePayoutStatement";
import { createElement } from "react";

const VALID: AffiliateState[] = ["pending", "active", "suspended"];

export type SetCustomRateResult =
  | { ok: true; code: string; customRatePct: number | null }
  | { ok: false; error: string };

/**
 * Manually override an affiliate's commission rate for NEW attributions,
 * overriding the auto-tier ladder. Pass `null` to clear the override
 * and fall back to the tier-based rate. Historical commissions already
 * attributed don't change — the rate is snapshotted at attribution time.
 */
export async function setAffiliateCustomRateAction(
  code: string,
  customRatePct: number | null,
): Promise<SetCustomRateResult> {
  const aff = await findAffiliateByCode(code);
  if (!aff) return { ok: false, error: `Affiliate ${code} not found.` };

  if (customRatePct !== null) {
    if (
      typeof customRatePct !== "number" ||
      !Number.isFinite(customRatePct) ||
      customRatePct < 0 ||
      customRatePct > 60
    ) {
      return { ok: false, error: "Rate must be between 0 and 60." };
    }
  }

  const actor = await currentAdminActor();
  const now = new Date().toISOString();
  await updateAffiliate(code, {
    customRatePct: customRatePct ?? undefined,
    customRateSetISO: customRatePct !== null ? now : undefined,
    customRateSetByAdminId: customRatePct !== null ? actor.id : undefined,
  });

  await recordAuditEvent({
    actor,
    action: customRatePct === null
      ? "affiliate.customRate.cleared"
      : "affiliate.customRate.set",
    target: { collection: "affiliates", id: code },
    summary: customRatePct === null
      ? `${code}: custom rate cleared (back to tier ${aff.tier} ${aff.tierRatePct}%)`
      : `${code}: custom rate set to ${customRatePct}%`,
    details: { previous: aff.customRatePct ?? null, next: customRatePct },
  }).catch(() => {});

  revalidatePath("/admin/affiliates");
  revalidatePath("/affiliate");
  return { ok: true, code, customRatePct };
}

export type AffiliateStateResult =
  | { ok: true; code: string; state: AffiliateState }
  | { ok: false; error: string };

export async function setAffiliateStateAction(
  code: string,
  state: AffiliateState,
): Promise<AffiliateStateResult> {
  if (!VALID.includes(state)) {
    return { ok: false, error: `Invalid state: ${state}` };
  }
  const before = await findAffiliateByCode(code);
  if (!before) return { ok: false, error: `Affiliate ${code} not found` };
  const updated = await setAffiliateState(code, state);
  if (!updated) return { ok: false, error: "Update failed" };

  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "affiliate.setState",
    target: { collection: "affiliates", id: code },
    summary: `${code}: ${before.state} → ${state}`,
    details: { previous: before.state, next: state },
  }).catch(() => {});

  revalidatePath("/admin/affiliates");
  revalidatePath("/affiliate");
  return { ok: true, code, state };
}

export type PayoutResult =
  | {
      ok: true;
      code: string;
      ordersPaid: number;
      totalPaidMinor: number;
    }
  | { ok: false; error: string };

export async function payoutEligibleAction(
  code: string,
  method: PayoutMethod,
  reference?: string,
  note?: string,
): Promise<PayoutResult> {
  if (!code?.trim()) return { ok: false, error: "Missing affiliate code." };
  const aff = await findAffiliateByCode(code);
  if (!aff) return { ok: false, error: `Affiliate ${code} not found` };

  const { orderRefs, totalPaidMinor } = await markAllEligiblePaidOut(code, {
    method,
    reference,
    note,
  });
  if (orderRefs.length === 0) {
    return { ok: false, error: "No eligible commissions to pay out." };
  }

  // Keep the per-record paidOutCount in sync with the actual stored
  // paid-out rows so the admin's "N paid" tiles don't drift.
  await updateAffiliate(code, {
    paidOutCount: (aff.paidOutCount ?? 0) + orderRefs.length,
  });

  const actor = await currentAdminActor();
  await recordAuditEvent({
    actor,
    action: "affiliate.payout",
    target: { collection: "affiliates", id: code },
    summary: `Paid out ${orderRefs.length} commission${
      orderRefs.length === 1 ? "" : "s"
    } to ${code} ($${(totalPaidMinor / 100).toFixed(2)} via ${method})`,
    details: {
      orderRefs,
      totalPaidMinor,
      method,
      reference: reference ?? null,
      note: note ?? null,
    },
  }).catch(() => {});

  // Transactional email: payout statement to the affiliate. One row per
  // paid-out order with the commission amount. Non-blocking.
  if (aff.email) {
    const periodLabel = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const lines: Array<{
      dateDisplay: string;
      orderRef: string;
      type: "approved";
      commissionDisplay: string;
    }> = [];
    for (const ref of orderRefs) {
      const rows = await listAttributionsByOrderRef(ref).catch(() => []);
      const row = rows.find((r) => r.affiliateCode === aff.code);
      const amount = row?.commissionAmountMinor ?? 0;
      lines.push({
        dateDisplay: row
          ? new Date(row.placedISO).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—",
        orderRef: ref,
        type: "approved",
        commissionDisplay: `$${(amount / 100).toFixed(2)}`,
      });
    }
    const payoutMethodLabel =
      method === "bank"
        ? "Bank transfer"
        : method === "wise"
        ? "Wise"
        : method === "paypal"
        ? "PayPal"
        : "Other";
    const emailResult = await sendEmail({
      to: aff.email,
      subject: `Your Sphere of Kings earnings · ${periodLabel}`,
      react: createElement(AffiliatePayoutStatement, {
        firstName: aff.firstName,
        code: aff.code,
        periodLabel,
        tierName: aff.tier,
        tierRate: aff.tierRatePct,
        approvedCount: orderRefs.length,
        payoutDisplay: `$${(totalPaidMinor / 100).toFixed(2)}`,
        payoutMethod: reference
          ? `${payoutMethodLabel} · ref ${reference}`
          : payoutMethodLabel,
        lines,
      }),
    }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));
    await recordAuditEvent({
      actor,
      action: emailResult.ok
        ? "affiliate.email.payout.sent"
        : "affiliate.email.payout.failed",
      target: { collection: "affiliates", id: code },
      summary: emailResult.ok
        ? `Payout statement sent to ${aff.email}`
        : `Payout statement NOT sent: ${emailResult.reason}`,
      details: {
        to: aff.email,
        resendId: emailResult.ok ? emailResult.id : null,
        reason: emailResult.ok ? null : emailResult.reason,
      },
    }).catch(() => {});
  }

  revalidatePath("/admin/affiliates");
  revalidatePath("/affiliate");
  revalidatePath("/admin");
  return {
    ok: true,
    code,
    ordersPaid: orderRefs.length,
    totalPaidMinor,
  };
}
