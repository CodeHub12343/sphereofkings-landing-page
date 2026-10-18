export type QuoteState =
  | "new"
  | "under-review"
  | "info-required"
  | "approved"
  | "declined"
  | "counteroffer"
  | "expired";

export type QuoteLine = {
  productSlug: string;
  productName: string;
  qty: number;
};

export type SampleQuote = {
  ref: string;
  submittedISO: string;
  business: string;
  contactName: string;
  email: string;
  phone?: string;
  requestedTier: "auto" | "40";
  autoTierPct: number;
  neededBy?: string;
  notes?: string;
  lines: QuoteLine[];
  state: QuoteState;
};

export const SAMPLE_QUOTES: SampleQuote[] = [
  {
    ref: "WH-0128",
    submittedISO: "2026-10-17T07:14:00Z",
    business: "Northside Toys Ltd.",
    contactName: "Jemima Oyedele",
    email: "orders@northsidetoys.com",
    phone: "+234 801 234 5678",
    requestedTier: "auto",
    autoTierPct: 20,
    neededBy: "December 20, 2026",
    notes:
      "Looking to stock 24 complete 7-in-1 units plus 12 Royal Checkers refills for the Christmas window.",
    lines: [
      { productSlug: "complete-7-in-1", productName: "Complete 7-in-1", qty: 24 },
      {
        productSlug: "royal-checkers-refill",
        productName: "Royal Checkers refill",
        qty: 12,
      },
    ],
    state: "new",
  },
  {
    ref: "WH-0127",
    submittedISO: "2026-10-16T14:48:00Z",
    business: "Royal Game Society",
    contactName: "Harriet Lin",
    email: "harriet@royalgamesociety.org",
    requestedTier: "40",
    autoTierPct: 30,
    neededBy: "January 15, 2027",
    notes:
      "Requesting the 40% tier for 220 units across the sphere range to seed a club network.",
    lines: [
      { productSlug: "complete-7-in-1", productName: "Complete 7-in-1", qty: 120 },
      {
        productSlug: "royal-triple-pack",
        productName: "Royal Triple Pack",
        qty: 50,
      },
      {
        productSlug: "kingdom-5-pack",
        productName: "Kingdom 5-Pack",
        qty: 50,
      },
    ],
    state: "under-review",
  },
  {
    ref: "WH-0124",
    submittedISO: "2026-10-14T09:22:00Z",
    business: "Lagos Chess Academy",
    contactName: "Tunde Bello",
    email: "tunde@lagoschess.ng",
    phone: "+234 802 555 1200",
    requestedTier: "auto",
    autoTierPct: 10,
    neededBy: "December 10, 2026",
    notes:
      "Serving 8 member schools. Can split shipment across two addresses — need confirmation this is possible.",
    lines: [
      {
        productSlug: "complete-7-in-1",
        productName: "Complete 7-in-1",
        qty: 32,
      },
    ],
    state: "info-required",
  },
  {
    ref: "WH-0119",
    submittedISO: "2026-10-11T11:04:00Z",
    business: "Northfield Grammar School",
    contactName: "Alex Reeves",
    email: "a.reeves@northfield.sch.uk",
    requestedTier: "auto",
    autoTierPct: 20,
    neededBy: "December 1, 2026",
    notes:
      "Classroom set across years 5–8. Would like a short teachers' guide bundled.",
    lines: [
      {
        productSlug: "kingdom-5-pack",
        productName: "Kingdom 5-Pack",
        qty: 24,
      },
    ],
    state: "approved",
  },
  {
    ref: "WH-0117",
    submittedISO: "2026-10-10T17:52:00Z",
    business: "Mendez Collector Shop",
    contactName: "Carlos Mendez",
    email: "carlos@mendezcollectors.co",
    requestedTier: "40",
    autoTierPct: 30,
    notes:
      "Asking for 40% on 300 units — we offered a counteroffer at 30% + marketing bundle.",
    lines: [
      {
        productSlug: "complete-7-in-1",
        productName: "Complete 7-in-1",
        qty: 300,
      },
    ],
    state: "counteroffer",
  },
  {
    ref: "WH-0114",
    submittedISO: "2026-10-08T13:17:00Z",
    business: "Bright Learning Co.",
    contactName: "Simone Bright",
    email: "simone@brightlearning.io",
    requestedTier: "auto",
    autoTierPct: 10,
    notes: "Reseller inquiry — asked for exclusivity in region. Declined.",
    lines: [
      {
        productSlug: "complete-7-in-1",
        productName: "Complete 7-in-1",
        qty: 60,
      },
    ],
    state: "declined",
  },
  {
    ref: "WH-0098",
    submittedISO: "2026-09-20T07:48:00Z",
    business: "Riverside Hobby",
    contactName: "Priya Narang",
    email: "orders@riversidehobby.co",
    requestedTier: "auto",
    autoTierPct: 10,
    notes:
      "Original request from September. 14-day window to confirm has passed.",
    lines: [
      {
        productSlug: "royal-triple-pack",
        productName: "Royal Triple Pack",
        qty: 18,
      },
    ],
    state: "expired",
  },
];

export const QUOTE_STATE_META: Record<
  QuoteState,
  { label: string; tone: "new" | "ok" | "warn" | "muted" | "crim" | "royal" }
> = {
  new: { label: "New request", tone: "new" },
  "under-review": { label: "Under review", tone: "royal" },
  "info-required": { label: "More info required", tone: "warn" },
  approved: { label: "Approved", tone: "ok" },
  declined: { label: "Declined", tone: "crim" },
  counteroffer: { label: "Counteroffer", tone: "warn" },
  expired: { label: "Expired", tone: "muted" },
};

export function totalUnits(q: SampleQuote): number {
  return q.lines.reduce((n, l) => n + l.qty, 0);
}

export function effectiveTier(q: SampleQuote): string {
  return q.requestedTier === "40"
    ? "40% · owner review"
    : `${q.autoTierPct}% · automatic`;
}
