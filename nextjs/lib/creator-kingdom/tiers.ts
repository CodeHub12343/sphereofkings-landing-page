// Follower-tier calculator. The deliverables are frozen into each
// assignment at acceptance, so later follower fluctuations cannot
// change the agreed workload.

export interface AssignmentRequirements {
  followerTierMin: number;
  originalVideosRequired: number;
  totalPostsRequired: number;
  creditsOnCompletion: number;
  targetPromotionalValueUSD: number;
}

const TIERS: AssignmentRequirements[] = [
  { followerTierMin: 1_000_000, originalVideosRequired: 1,  totalPostsRequired: 2,  creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 500_000,   originalVideosRequired: 1,  totalPostsRequired: 3,  creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 250_000,   originalVideosRequired: 2,  totalPostsRequired: 4,  creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 100_000,   originalVideosRequired: 3,  totalPostsRequired: 6,  creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 50_000,    originalVideosRequired: 4,  totalPostsRequired: 8,  creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 25_000,    originalVideosRequired: 6,  totalPostsRequired: 12, creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 10_000,    originalVideosRequired: 8,  totalPostsRequired: 16, creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 5_000,     originalVideosRequired: 12, totalPostsRequired: 24, creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 1_000,     originalVideosRequired: 15, totalPostsRequired: 30, creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
  { followerTierMin: 100,       originalVideosRequired: 20, totalPostsRequired: 40, creditsOnCompletion: 500, targetPromotionalValueUSD: 500 },
];

export function calculateAssignment(followers: number): AssignmentRequirements {
  if (!Number.isSafeInteger(followers) || followers < 100) {
    throw new Error("Manual eligibility review required");
  }
  const tier = TIERS.find((t) => followers >= t.followerTierMin);
  // The guard above ensures followers >= 100, so a tier always matches.
  return tier!;
}

export const ALL_TIERS = TIERS;
