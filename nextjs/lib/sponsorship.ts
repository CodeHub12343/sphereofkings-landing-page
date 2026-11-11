// Sponsorship program configuration — single source of truth for the
// public /sponsorship page, server actions, Stripe webhook, and admin.
//
// James (owner) decided on 2026-11-11 to collapse to a single
// $5,000 Premier Sponsorship offer with 10 available slots. The old
// Silver / Gold split is retired; the legacy ids remain in the type
// union only so any DB rows, Stripe metadata, or admin tooling that
// already recorded tier="silver" / tier="gold" from the previous
// configuration continue to parse without a migration.

export type SponsorshipTierId = "silver" | "gold";

export type SponsorshipTier = {
  id: SponsorshipTierId;
  name: string;
  priceDisplay: string;
  priceMinor: number;
  totalSlots: number;
  tagline: string;
  summary: string;
  highlights: string[];
  benefits: Array<{ heading: string; items: string[] }>;
};

export const KICKSTARTER_LAUNCH_DATE = "November 19, 2026";

// The one live tier. The internal id stays "silver" to keep legacy
// rows (if any ever get inserted before the DB is cleared) compatible.
// Everything the shopper sees is the new Premier branding, price and
// benefits.
const PREMIER: SponsorshipTier = {
  id: "silver",
  name: "Premier Sphere of Kings Sponsorship",
  priceDisplay: "$5,000",
  priceMinor: 500_000,
  totalSlots: 10,
  tagline: "90–120-day multi-channel promotional partnership",
  summary:
    "One flat $5,000 sponsorship with a 1,000,000 combined promotional view commitment across Kickstarter advertising with Jellop, targeted retail outreach through PostcardMania, and our own social media channels.",
  highlights: [
    "1,000,000 combined promotional view commitment",
    "90–120 days of marketing exposure",
    "Jellop Kickstarter advertising on Meta, Google, YouTube, Reddit and email",
    "PostcardMania direct-mail outreach to toy, hobby and board-game retailers",
    "Up to 3 Sphere of Kings social posts per day across Facebook, Instagram, TikTok and YouTube",
    "Official Sphere of Kings sponsor recognition on the website and campaign content",
    "Campaign performance reporting with the agreed measurement metric",
  ],
  benefits: [
    {
      heading: "Jellop — Professional Kickstarter Advertising",
      items: [
        "Facebook advertising targeted at gaming enthusiasts, crowdfunding audiences and potential backers.",
        "Instagram advertising aimed at tabletop gamers, families and entertainment audiences.",
        "Google Search advertising reaching people actively searching for games, puzzles and crowdfunding projects.",
        "Google Display advertising across eligible websites and placements.",
        "YouTube video advertising showcasing Sphere of Kings to relevant viewers.",
        "Reddit advertising inside relevant gaming, tabletop and crowdfunding communities.",
        "Permission-based email marketing to relevant audiences.",
        "Retargeting campaigns that re-engage interested viewers across eligible platforms.",
        "Audience optimization using live performance data to improve efficiency.",
        "Kickstarter conversion marketing directing warm traffic to our campaign.",
      ],
    },
    {
      heading: "PostcardMania — Targeted Retail Outreach",
      items: [
        "Direct-mail campaigns to toy stores and independent toy retailers.",
        "Outreach to board-game stores, hobby shops and tabletop gaming stores.",
        "Mailing to specialty game stores, puzzle stores and educational-toy retailers.",
        "Postcards sent to family entertainment retailers, comic/collectible stores and gift shops.",
        "Independent retailers, regional retail chains, game distributors and wholesale buyers.",
        "Customized business mailing lists built with PostcardMania targeting store owners, purchasing departments and retail decision-makers.",
        "Postcards promote Sphere of Kings, the Kickstarter campaign and participating sponsors where included in the approved creative.",
      ],
    },
    {
      heading: "Sphere of Kings Social Media Marketing",
      items: [
        "Facebook posts, videos and reels.",
        "Instagram posts, stories and reels.",
        "TikTok promotional videos.",
        "YouTube videos and Shorts.",
        "Kickstarter campaign updates.",
        "Influencer and creator collaborations.",
        "Promotional partnerships and sponsor recognition.",
        "Planned publishing cadence of up to three posts per day across selected platforms.",
      ],
    },
    {
      heading: "What Our $5,000 Sponsors Receive",
      items: [
        "Commitment to deliver at least 1,000,000 combined promotional content views. If the target is not reached during the initial campaign period, we intend to continue the agreed promotional activities until it is.",
        "90–120 days of marketing exposure through our planned campaign activities.",
        "Recognition as an official Sphere of Kings sponsor — website, promotional content and campaign placements as agreed.",
        "Exposure opportunities tied to our digital, social, Kickstarter and direct-mail strategy.",
        "Opportunities to introduce your business to gamers, families, crowdfunding supporters and prospective retail partners.",
        "Updates on measurable promotional performance, including reported content views and applicable advertising metrics.",
      ],
    },
    {
      heading: "Campaign Terms & Verification",
      items: [
        "Advertising impressions, video views and unique viewers are different metrics; only the agreed metric will count toward the 1,000,000-view commitment.",
        "Retail outreach does not guarantee retail placement or distribution.",
        "Specific sponsor placements, advertising budgets, campaign schedules, measurement methods and view-guarantee remedies are set out in the final written sponsorship agreement delivered after payment.",
        "Jellop advertises primarily through Meta, Google, Reddit, YouTube and email; PostcardMania builds the customized retail mailing lists for toy, hobby and board-game outreach.",
      ],
    },
  ],
};

// Legacy tier kept only so lookups against old data don't throw.
// Never shown publicly, never sold, never reserved.
const RETIRED_GOLD: SponsorshipTier = {
  id: "gold",
  name: "Gold Premier Business Sponsor (retired)",
  priceDisplay: "$10,000",
  priceMinor: 1_000_000,
  totalSlots: 0,
  tagline: "Retired — see the $5,000 Premier Sponsorship",
  summary:
    "The old $10,000 Gold Premier tier has been retired. The current sponsorship offer is a single $5,000 Premier Sponsorship with 10 slots.",
  highlights: [],
  benefits: [],
};

export const SPONSORSHIP_TIERS: Record<SponsorshipTierId, SponsorshipTier> = {
  silver: PREMIER,
  gold: RETIRED_GOLD,
};

// Per-tier numeric commitments. Used by the sponsor dashboard to show
// "shoutouts delivered X of Y" progress rings against each kind of
// deliverable. Kept for back-compat with existing dashboards; the new
// Premier sponsorship is tracked primarily against its 1M-view
// commitment rather than individual deliverable counts.
export type SponsorshipCommitments = {
  shoutouts: number;
  videos: number;
  boostedPosts: number;
  appreciationPosts: number;
  spotlights: number;
  dedicatedVideos: number;
};

export const COMMITMENTS: Record<SponsorshipTierId, SponsorshipCommitments> = {
  silver: {
    shoutouts: 0,
    videos: 0,
    boostedPosts: 0,
    appreciationPosts: 0,
    spotlights: 0,
    dedicatedVideos: 0,
  },
  gold: {
    shoutouts: 0,
    videos: 0,
    boostedPosts: 0,
    appreciationPosts: 0,
    spotlights: 0,
    dedicatedVideos: 0,
  },
};

export const CAMPAIGN_DAYS = 120;

// Headline promotional-view commitment carried by the Premier offer.
export const PROMOTIONAL_VIEW_COMMITMENT = 1_000_000;

export function tier(id: SponsorshipTierId): SponsorshipTier {
  return SPONSORSHIP_TIERS[id];
}

// Public-facing list — only the live Premier tier. Legacy Gold is
// deliberately excluded.
export function allTiers(): SponsorshipTier[] {
  return [PREMIER];
}

export function isTierId(x: unknown): x is SponsorshipTierId {
  return x === "silver" || x === "gold";
}
