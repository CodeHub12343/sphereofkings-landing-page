// Commission ladder for the affiliate program.
//
// A tier is picked by the number of ELIGIBLE orders an affiliate has
// recorded (payment confirmed, not refunded). The commission %
// SNAPSHOTTED at attribution time stays with each historical order, so
// a promotion only affects orders attributed AFTER the promotion fires.

import { AffiliateTier } from "@/lib/sample-affiliates";

export type TierSpec = {
  name: AffiliateTier;
  ratePct: number;
  // Minimum eligible-orders count to hold this tier.
  minEligibleOrders: number;
};

export const AFFILIATE_TIERS: TierSpec[] = [
  { name: "Starter",   ratePct: 5,  minEligibleOrders: 0 },
  { name: "Silver",    ratePct: 10, minEligibleOrders: 50 },
  { name: "Gold",      ratePct: 15, minEligibleOrders: 150 },
  { name: "Royal",     ratePct: 20, minEligibleOrders: 300 },
  { name: "Imperial",  ratePct: 25, minEligibleOrders: 600 },
  { name: "Sovereign", ratePct: 30, minEligibleOrders: 1000 },
];

export function tierForEligibleCount(count: number): TierSpec {
  // Highest tier whose threshold the count meets. Iterate from the
  // bottom so we always return the right one even if the array ever
  // gets reordered.
  let picked = AFFILIATE_TIERS[0];
  for (const t of AFFILIATE_TIERS) {
    if (count >= t.minEligibleOrders) picked = t;
  }
  return picked;
}

// Next tier above the picked one (null when already at the top). Used
// by the affiliate dashboard to show the "N of M" progress bar.
export function nextTier(current: AffiliateTier): TierSpec | null {
  const i = AFFILIATE_TIERS.findIndex((t) => t.name === current);
  if (i < 0 || i >= AFFILIATE_TIERS.length - 1) return null;
  return AFFILIATE_TIERS[i + 1];
}
