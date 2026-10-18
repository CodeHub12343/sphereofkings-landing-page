// Sample orders for the admin UI design pass. Clearly labelled as sample
// in the UI so no operator mistakes them for real records. Replace with
// a server data source once orders persist.

export type OrderOrigin = "early-bird" | "kickstarter" | "wholesale";
export type PaymentState =
  | "pending"
  | "paid"
  | "failed"
  | "refund-pending"
  | "partially-refunded"
  | "refunded";
export type FulfillmentState = "none" | "produced" | "packed" | "dispatched";

export type ShipTo = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postal: string;
  country: string;
};

export type SampleOrder = {
  ref: string;
  placedISO: string;
  customerName: string;
  customerEmailMasked: string;
  origin: OrderOrigin;
  affiliateCode?: string;
  itemSummary: string;
  totalDisplay: string; // "$—" while prices unapproved; a tabular value otherwise
  payment: PaymentState;
  fulfillment: FulfillmentState;
  shipTo?: ShipTo;
};

export function formatShipTo(s: ShipTo): string {
  const lines = [s.name, s.line1, s.line2, `${s.city} ${s.postal}`.trim(), s.country];
  return lines.filter(Boolean).join("\n");
}

export const SAMPLE_ORDERS: SampleOrder[] = [
  {
    ref: "SOK-004219",
    placedISO: "2026-10-17T08:12:00Z",
    customerName: "Marion Clarke",
    customerEmailMasked: "marion@…",
    origin: "early-bird",
    itemSummary: "1 × 7-in-1",
    totalDisplay: "$—",
    payment: "pending",
    fulfillment: "none",
  },
  {
    ref: "SOK-004218",
    placedISO: "2026-10-17T06:48:00Z",
    customerName: "Benjamin Osei",
    customerEmailMasked: "benjamin@…",
    origin: "early-bird",
    affiliateCode: "POSTER-247",
    itemSummary: "2 × Royal Triple",
    totalDisplay: "$—",
    payment: "paid",
    fulfillment: "produced",
    shipTo: {
      name: "Benjamin Osei",
      line1: "12 Grove Lane",
      line2: "Flat 3",
      city: "Lagos",
      postal: "101233",
      country: "Nigeria",
    },
  },
  {
    ref: "SOK-004210",
    placedISO: "2026-10-16T10:03:00Z",
    customerName: "Northside Toys Ltd.",
    customerEmailMasked: "orders@…",
    origin: "wholesale",
    itemSummary: "24 × 7-in-1",
    totalDisplay: "$—",
    payment: "paid",
    fulfillment: "packed",
  },
  {
    ref: "SOK-004193",
    placedISO: "2026-10-15T14:40:00Z",
    customerName: "Yemisi Ade",
    customerEmailMasked: "yemisi@…",
    origin: "early-bird",
    itemSummary: "1 × 7-in-1",
    totalDisplay: "$—",
    payment: "refund-pending",
    fulfillment: "dispatched",
  },
  {
    ref: "SOK-004177",
    placedISO: "2026-10-14T18:11:00Z",
    customerName: "Carlos Mendez",
    customerEmailMasked: "carlos@…",
    origin: "kickstarter",
    itemSummary: "1 × 7-in-1 + Supporter",
    totalDisplay: "$—",
    payment: "failed",
    fulfillment: "none",
  },
  {
    ref: "SOK-004161",
    placedISO: "2026-10-13T09:22:00Z",
    customerName: "Kingsley Hamid",
    customerEmailMasked: "kingsley@…",
    origin: "early-bird",
    affiliateCode: "POSTER-247",
    itemSummary: "1 × Royal Triple",
    totalDisplay: "$—",
    payment: "paid",
    fulfillment: "produced",
    shipTo: {
      name: "Kingsley Hamid",
      line1: "48 Ridgeway",
      city: "Birmingham",
      postal: "B17 9HG",
      country: "United Kingdom",
    },
  },
  {
    ref: "SOK-004150",
    placedISO: "2026-10-12T20:04:00Z",
    customerName: "Aisha Rahman",
    customerEmailMasked: "aisha@…",
    origin: "early-bird",
    itemSummary: "1 × Kingdom 5-Pack",
    totalDisplay: "$—",
    payment: "paid",
    fulfillment: "dispatched",
    shipTo: {
      name: "Aisha Rahman",
      line1: "202 Baker Street",
      line2: "Suite 4",
      city: "London",
      postal: "NW1 6XE",
      country: "United Kingdom",
    },
  },
];

export function formatRelative(iso: string, nowMs: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = nowMs - t;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
