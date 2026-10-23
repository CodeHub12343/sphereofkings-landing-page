"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  AFF_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";
import {
  findAffiliateByCode,
  updateAffiliate,
} from "@/lib/db/collections/affiliates";
import type { PayoutMethodKind } from "@/lib/sample-affiliates";
import { recordAuditEvent } from "@/lib/db/collections/audit";

export type SavePayoutMethodState =
  | { ok: true; savedISO: string }
  | { ok: false; error: string }
  | { ok?: undefined };

const ALLOWED_METHODS: PayoutMethodKind[] = ["bank", "wise", "paypal"];

/**
 * Save the signed-in affiliate's chosen payout method and destination.
 * Called from the self-serve form at /affiliate/payout. The admin
 * payout drawer reads these fields when fulfilling withdrawal
 * requests, so the operator doesn't have to ask the affiliate each
 * time.
 */
export async function savePayoutMethodAction(
  _prev: SavePayoutMethodState,
  formData: FormData,
): Promise<SavePayoutMethodState> {
  const jar = await cookies();
  const payload = await readSessionToken(
    jar.get(AFF_SESSION_COOKIE)?.value,
    "affiliate",
  ).catch(() => null);
  if (!payload) return { ok: false, error: "You're signed out. Sign in and try again." };

  const method = String(formData.get("method") ?? "").trim() as PayoutMethodKind;
  const details = String(formData.get("details") ?? "").trim();

  if (!ALLOWED_METHODS.includes(method)) {
    return { ok: false, error: "Pick a payout method." };
  }
  if (details.length < 4) {
    return {
      ok: false,
      error:
        method === "paypal"
          ? "Enter the PayPal email that will receive payouts."
          : method === "wise"
            ? "Enter your Wise handle or the email on your Wise account."
            : "Enter your bank account details — IBAN, account + sort code, or account + routing number.",
    };
  }
  if (details.length > 400) {
    return { ok: false, error: "Payout details are too long (400 character max)." };
  }

  const aff = await findAffiliateByCode(payload.id);
  if (!aff) return { ok: false, error: "Affiliate account not found." };

  const savedISO = new Date().toISOString();
  await updateAffiliate(aff.code, {
    payoutMethod: method,
    payoutDetails: details,
    payoutUpdatedISO: savedISO,
  });

  await recordAuditEvent({
    actor: { kind: "affiliate", id: aff.code, label: `${aff.firstName} ${aff.lastName}` },
    action: "affiliate.payout-method.updated",
    target: { collection: "affiliates", id: aff.code },
    summary: `Affiliate ${aff.code} set payout method to ${method}`,
    // Never log the raw details — they contain bank/PayPal/Wise PII.
    details: { method, hasDetails: true },
  }).catch(() => {});

  revalidatePath("/affiliate");
  revalidatePath("/affiliate/payout");
  revalidatePath(`/admin/affiliates`);
  return { ok: true, savedISO };
}
