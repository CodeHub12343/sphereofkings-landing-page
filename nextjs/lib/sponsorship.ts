// Sponsorship program configuration — single source of truth for the
// public /sponsorship page, server actions, stripe webhook, and admin.
//
// James (owner) wants 10 Silver slots at $3,000 and 5 Gold slots at
// $10,000, available for purchase from the website. When a tier is
// sold out the buyer joins a notification waitlist that emails them
// when a slot opens.

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

export const SPONSORSHIP_TIERS: Record<SponsorshipTierId, SponsorshipTier> = {
  silver: {
    id: "silver",
    name: "Silver Business Sponsor",
    priceDisplay: "$3,000",
    priceMinor: 300_000,
    totalSlots: 10,
    tagline: "90-day regional promotional partnership",
    summary:
      "A regional and digital advertising partnership for retailers, hobby stores, family entertainment businesses, and growing companies.",
    highlights: [
      "30 branded social media shoutouts",
      "12 professionally edited promotional videos",
      "30 boosted promotional posts",
      "6 business spotlight features",
      "90 days of website logo placement",
      "Monthly campaign performance reports",
    ],
    benefits: [
      {
        heading: "Social Media Marketing",
        items: [
          "30 branded social media shoutouts throughout the campaign.",
          "12 professionally edited short-form promotional videos featuring sponsor recognition.",
          "30 boosted promotional posts, subject to an agreed advertising budget.",
          "12 dedicated sponsor appreciation posts.",
          "6 business spotlight features highlighting your company, products, or services.",
          "Sponsor mentions in applicable product launch announcements.",
          "Sponsor tagging and website links wherever supported.",
        ],
      },
      {
        heading: "Website Advertising",
        items: [
          "90 days of business logo placement on the Sphere of Kings sponsorship page.",
          "Dedicated sponsor profile with business description, contact details, and website link.",
          "Clickable logo directing visitors to your business website.",
          "Sponsor recognition in applicable campaign updates.",
          "Silver Sponsor digital recognition badge for your business to use in its marketing.",
        ],
      },
      {
        heading: "Video and Content Marketing",
        items: [
          "Sponsor recognition in 12 promotional videos.",
          "Two of those videos dedicated to highlighting the sponsor's business.",
          "Branded sponsor introduction graphics.",
          "Permission to repost the sponsor-specific videos on your own business channels.",
        ],
      },
      {
        heading: "Retail and Customer Engagement",
        items: [
          "Customized promotional flyer featuring Sphere of Kings and your business logo.",
          "Digital promotional materials suitable for in-store display.",
          "QR-code campaign graphics linking customers to our Kickstarter page.",
          "Co-branded giveaway promotion, subject to agreed prizes and rules.",
          "Opportunity to discuss future Sphere of Kings retail sales.",
        ],
      },
      {
        heading: "Reporting",
        items: [
          "Monthly campaign activity report.",
          "Social media reach and engagement summaries where available.",
          "Video publication and promotional activity records.",
          "End-of-campaign sponsorship summary.",
        ],
      },
    ],
  },
  gold: {
    id: "gold",
    name: "Gold Premier Business Sponsor",
    priceDisplay: "$10,000",
    priceMinor: 1_000_000,
    totalSlots: 5,
    tagline: "90-day premium promotional partnership",
    summary:
      "A comprehensive premium promotional partnership designed to deliver frequent business exposure, targeted advertising, retail engagement, and exclusive sponsor opportunities.",
    highlights: [
      "150 branded social media shoutouts",
      "45 professionally edited promotional videos",
      "90 boosted social media posts",
      "15 business spotlight features",
      "Premium website logo and banner placement",
      "Priority retail partnership discussions",
      "Category exclusivity consideration",
      "Dedicated sponsorship coordinator",
    ],
    benefits: [
      {
        heading: "High-Volume Social Media Promotion",
        items: [
          "150 branded social media shoutouts over 90 days.",
          "45 professionally edited promotional videos featuring sponsor recognition.",
          "90 boosted social media posts, subject to an agreed advertising budget.",
          "30 dedicated sponsor appreciation and recognition posts.",
          "15 dedicated business spotlight features.",
          "Sponsor recognition in applicable major Kickstarter launch announcements.",
          "Co-branded product and business promotional campaigns.",
        ],
      },
      {
        heading: "Premium Website Branding",
        items: [
          "90 days of premium logo placement on the Sphere of Kings website.",
          "Featured Gold Sponsor profile with business description, photos, and website links.",
          "Prominent sponsor placement on applicable campaign landing pages.",
          "Clickable promotional banner linking to your business.",
          "Gold Premier Sponsor digital badge.",
          "QR-code promotional graphics linking customers directly to your business.",
          "Priority placement above standard sponsorship listings.",
        ],
      },
      {
        heading: "Premium Video Advertising",
        items: [
          "45 short-form promotional videos incorporating sponsor recognition.",
          "10 dedicated business promotional videos highlighting your company.",
          "Sponsor recognition in selected Kickstarter promotional productions.",
          "Branded introductions, closing graphics, and sponsor acknowledgments.",
          "Approved video assets available for the sponsor's own marketing.",
        ],
      },
      {
        heading: "Business Lead Generation",
        items: [
          "Dedicated sponsor landing page with a direct website link.",
          "QR-code advertising campaigns directing viewers to your business.",
          "Co-branded promotional offers encouraging customers to visit your store or website.",
          "Trackable referral links where supported.",
          "Monthly reporting of available traffic, clicks, and engagement.",
        ],
      },
      {
        heading: "Retail Marketing and Promotion",
        items: [
          "Co-branded Sphere of Kings retail marketing materials.",
          "Customized digital store display graphics.",
          "Sponsor-branded promotional flyers and postcards.",
          "Priority discussions regarding future retail availability.",
          "Opportunity to explore regional product distribution arrangements.",
        ],
      },
      {
        heading: "Exclusivity & Kickstarter Launch Recognition",
        items: [
          "Opportunity to negotiate category exclusivity for the 90-day campaign.",
          "Priority recognition within the sponsor's approved business category.",
          "Gold Premier Sponsor recognition in applicable Kickstarter launch materials.",
          "Featured sponsor appreciation announcement.",
          "First opportunity to discuss renewal of premium sponsorship placement.",
        ],
      },
      {
        heading: "Premium Reporting & Account Management",
        items: [
          "Dedicated sponsorship coordinator.",
          "Monthly sponsor performance summaries.",
          "Website referral and click tracking where available.",
          "End-of-campaign performance report and final partnership review.",
        ],
      },
    ],
  },
};

// Per-tier numeric commitments. Used by the sponsor dashboard to show
// "shoutouts delivered X of Y" progress rings against each kind of
// deliverable. Keep in sync with the benefits copy above.
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
    shoutouts: 30,
    videos: 12,
    boostedPosts: 30,
    appreciationPosts: 12,
    spotlights: 6,
    dedicatedVideos: 2,
  },
  gold: {
    shoutouts: 150,
    videos: 45,
    boostedPosts: 90,
    appreciationPosts: 30,
    spotlights: 15,
    dedicatedVideos: 10,
  },
};

export const CAMPAIGN_DAYS = 90;

export function tier(id: SponsorshipTierId): SponsorshipTier {
  return SPONSORSHIP_TIERS[id];
}

export function allTiers(): SponsorshipTier[] {
  return [SPONSORSHIP_TIERS.silver, SPONSORSHIP_TIERS.gold];
}

export function isTierId(x: unknown): x is SponsorshipTierId {
  return x === "silver" || x === "gold";
}
