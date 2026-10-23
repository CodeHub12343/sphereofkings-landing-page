"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  AFF_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import {
  listAvailableForWithdrawal,
  lockAttributionsForRequest,
} from "@/lib/db/collections/attributed-orders";
import {
  createWithdrawalRequest,
  listWithdrawalRequests,
} from "@/lib/db/collections/withdrawal-requests";
import { recordAuditEvent } from "@/lib/db/collections/audit";

// Minimum balance (in minor units — cents) to open a withdrawal
// request. Avoids spam-opening tiny requests. Pulled from env so you
// can tune it per environment without a redeploy.
const MIN_WITHDRAW_MINOR = Math.max(
  100,
  Number(process.env.AFFILIATE_MIN_WITHDRAW_MINOR ?? 2000),
);

export type CreateWithdrawalResult =
  | { ok: true; requestId: string; amountMinor: number }
  | { ok: false; error: string };

/**
 * Affiliate opens a withdrawal request for every eligible order they
 * have today. The request is created in `pending`, and the attributed
 * orders are LOCKED to it so the balance can't be re-requested.
 */
export async function requestWithdrawalAction(): Promise<CreateWithdrawalResult> {
  const jar = await cookies();
  const payload = await readSessionToken(
    jar.get(AFF_SESSION_COOKIE)?.value,
    "affiliate",
  ).catch(() => null);
  if (!payload) return { ok: false, error: "You're signed out. Sign in and try again." };

  const aff = await findAffiliateByCode(payload.id);
  if (!aff) return { ok: false, error: "Affiliate not found." };
  if (aff.state !== "active") {
    return { ok: false, error: `Account is ${aff.state}, not active.` };
  }
  if (!aff.payoutMethod || !aff.payoutDetails) {
    return {
      ok: false,
      error: "Set your payout method first — Payout settings.",
    };
  }

  // Reject if there's already a pending or approved request. A new
  // one can only start once admin finishes the previous.
  const open = await listWithdrawalRequests({ affiliateCode: aff.code });
  const outstanding = open.find((r) => r.status === "pending" || r.status === "approved");
  if (outstanding) {
    return {
      ok: false,
      error:
        outstanding.status === "pending"
          ? "You already have a pending withdrawal request. Wait for the admin to review it before opening another."
          : "A previous request is approved but not yet marked completed. You can open a new one once it clears.",
    };
  }

  const rows = await listAvailableForWithdrawal(aff.code);
  if (rows.length === 0) {
    return { ok: false, error: "No eligible commissions to withdraw yet." };
  }
  const amountMinor = rows.reduce((n, r) => n + (r.commissionAmountMinor ?? 0), 0);
  if (amountMinor < MIN_WITHDRAW_MINOR) {
    return {
      ok: false,
      error: `Your available balance ($${(amountMinor / 100).toFixed(
        2,
      )}) is below the $${(MIN_WITHDRAW_MINOR / 100).toFixed(
        2,
      )} minimum. Keep selling and request once you're over the threshold.`,
    };
  }

  const req = await createWithdrawalRequest({
    affiliateCode: aff.code,
    amountMinor,
    payoutMethod: aff.payoutMethod,
    payoutDetails: aff.payoutDetails,
    orderRefs: rows.map((r) => r.orderRef),
  });

  await lockAttributionsForRequest(
    aff.code,
    rows.map((r) => r.orderRef),
    req.id,
  );

  await recordAuditEvent({
    actor: { kind: "affiliate", id: aff.code, label: `${aff.firstName} ${aff.lastName}` },
    action: "affiliate.withdrawal.requested",
    target: { collection: "withdrawal_requests", id: req.id },
    summary: `Affiliate ${aff.code} requested $${(amountMinor / 100).toFixed(2)}`,
    details: {
      amountMinor,
      orderCount: rows.length,
      method: aff.payoutMethod,
    },
  }).catch(() => {});

  revalidatePath("/affiliate");
  revalidatePath("/admin/affiliates");
  revalidatePath("/admin/affiliates/requests");
  return { ok: true, requestId: req.id, amountMinor };
}
