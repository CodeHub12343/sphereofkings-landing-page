// Recomputes an affiliate's tier from their current eligible-orders
// count and persists the change when it moves. Called from the Stripe
// webhook after an attribution flips to "eligible" — a tier bump
// only takes effect for FUTURE attributions, since the per-order
// `commissionTierPct` is snapshotted at createAttribution time.

import {
  findAffiliateByCode,
  updateAffiliate,
} from "@/lib/db/collections/affiliates";
import { aggregateByAffiliate } from "@/lib/db/collections/attributed-orders";
import { tierForEligibleCount } from "@/lib/affiliate-tiers";
import { recordAuditEvent } from "@/lib/db/collections/audit";

export type PromotionResult =
  | { changed: false; code: string }
  | {
      changed: true;
      code: string;
      from: { tier: string; ratePct: number };
      to: { tier: string; ratePct: number };
      eligibleCount: number;
    };

export async function recomputeAffiliateTier(
  code: string,
): Promise<PromotionResult> {
  const aff = await findAffiliateByCode(code).catch(() => undefined);
  if (!aff) return { changed: false, code };

  const aggregates = await aggregateByAffiliate().catch(() => ({}));
  const eligibleCount = aggregates[code]?.eligibleOrders ?? 0;
  const picked = tierForEligibleCount(eligibleCount);

  if (picked.name === aff.tier && picked.ratePct === aff.tierRatePct) {
    return { changed: false, code };
  }

  const before = { tier: aff.tier, ratePct: aff.tierRatePct };
  await updateAffiliate(code, {
    tier: picked.name,
    tierRatePct: picked.ratePct,
    // Keep eligibleSales roughly in sync for the admin UI's quick view.
    // Aggregates remain the source of truth for display.
    eligibleSales: eligibleCount,
  });

  // Audit the promotion/demotion so it shows up on the overview and in
  // /admin/audit. System-attributed because the Stripe webhook (not an
  // admin session) triggers it.
  await recordAuditEvent({
    actor: { kind: "system" },
    action: "affiliate.tierChange",
    target: { collection: "affiliates", id: code },
    summary: `${code}: ${before.tier} (${before.ratePct}%) → ${picked.name} (${picked.ratePct}%)`,
    details: {
      eligibleCount,
      previous: before,
      next: { tier: picked.name, ratePct: picked.ratePct },
    },
  }).catch(() => {});

  return {
    changed: true,
    code,
    from: before,
    to: { tier: picked.name, ratePct: picked.ratePct },
    eligibleCount,
  };
}
