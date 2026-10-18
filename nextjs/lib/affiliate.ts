// Sample affiliate record for the dashboard design pass. Clearly labelled
// as sample in the UI so no operator mistakes it for a real record.
// Replace with a server data source + per-affiliate auth before shipping.

export type AttributedStatus =
  | "eligible"
  | "pending"
  | "refund-pending"
  | "cancelled"
  | "window-pending";

export type AttributedRow = {
  dateISO: string;
  orderRef: string;
  customer: string; // initial + surname
  units: number;
  status: AttributedStatus;
  // Share of the commission THIS affiliate holds on this order. 100
  // when they are the only attributed affiliate; less when the order
  // was split (e.g. first-touch 50% / last-touch 50%). Undefined on
  // older rows is treated as 100 by the UI.
  sharePct?: number;
  // Role in a split order — "sole" when sharePct is 100; "first" or
  // "last" when there is a co-attributed affiliate. Rendered as the
  // chip next to the status pill.
  touch?: "first" | "last" | "sole";
  // Dollar amount of commission on this row, in minor units (cents).
  // Only set once the Stripe webhook has flipped the order to paid
  // and we know the total.
  commissionAmountMinor?: number;
};

export type Affiliate = {
  code: string;
  firstName: string;
  // Tier that comes out of the commission table (5/10/15/20/25/30%).
  tier: { name: string; rate: number; nextName: string; nextRate: number };
  eligibleSales: number;
  nextThreshold: number; // sales to reach next tier
  salesLastWeek: number;
  pendingOrders: number;
  // Current period
  period: { label: string };
  // Approved / Paid are not yet reliably synced in this demo — surfaced
  // honestly with a "stale" indicator in the UI.
  approvedPendingSync: boolean;
  // The referral URL and QR id — generated per affiliate server-side in
  // production. Non-guessable.
  referralUrl: string;
  rows: AttributedRow[];
  // Live money totals in minor units (cents) when derived from stored
  // attributions. Optional for backward-compat with the demo sample.
  pendingCommissionMinor?: number;    // orders not yet confirmed paid
  approvedCommissionMinor?: number;   // paid, unpaid-out balance
  paidOutCommissionMinor?: number;    // already paid out to the affiliate
};

export const SAMPLE_AFFILIATE: Affiliate = {
  code: "POSTER-247",
  firstName: "Benjamin",
  tier: { name: "Gold", rate: 15, nextName: "Royal", nextRate: 20 },
  eligibleSales: 218,
  nextThreshold: 500,
  salesLastWeek: 34,
  pendingOrders: 42,
  period: { label: "Last 30 days" },
  approvedPendingSync: true,
  referralUrl: "sphereofkings.com/r/POSTER-247",
  rows: [
    {
      dateISO: "2026-10-16T08:12:00Z",
      orderRef: "SOK-004219",
      customer: "M. Clarke",
      units: 3,
      status: "pending",
    },
    {
      dateISO: "2026-10-15T06:48:00Z",
      orderRef: "SOK-004218",
      customer: "B. Osei",
      units: 3,
      status: "eligible",
    },
    {
      dateISO: "2026-10-14T10:03:00Z",
      orderRef: "SOK-004210",
      customer: "Y. Ade",
      units: 1,
      status: "eligible",
    },
    {
      dateISO: "2026-10-11T14:40:00Z",
      orderRef: "SOK-004193",
      customer: "Y. Ade",
      units: 1,
      status: "refund-pending",
    },
    {
      dateISO: "2026-10-09T18:11:00Z",
      orderRef: "SOK-004177",
      customer: "C. Mendez",
      units: 1,
      status: "cancelled",
    },
    {
      dateISO: "2026-10-08T09:22:00Z",
      orderRef: "SOK-004161",
      customer: "K. Hamid",
      units: 2,
      status: "window-pending",
    },
  ],
};

export const TIER_LADDER = [
  { name: "Starter", rate: 5, threshold: "Starting tier" },
  { name: "Silver", rate: 10, threshold: "More than 50 sales" },
  { name: "Gold", rate: 15, threshold: "More than 100 sales" },
  { name: "Royal", rate: 20, threshold: "More than 500 sales" },
  { name: "Imperial", rate: 25, threshold: "1,000 sales" },
  { name: "Sovereign", rate: 30, threshold: "5,000 sales" },
] as const;
