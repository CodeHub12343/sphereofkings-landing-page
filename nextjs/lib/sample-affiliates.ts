export type AffiliateState = "pending" | "active" | "suspended";

export type AffiliateTier =
  | "Starter"
  | "Silver"
  | "Gold"
  | "Royal"
  | "Imperial"
  | "Sovereign";

export type PayoutMethodKind = "bank" | "wise" | "paypal";

export type SampleAffiliate = {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedISO: string;
  tier: AffiliateTier;
  tierRatePct: number;
  eligibleSales: number;
  pendingOrders: number;
  // Commission counts kept in local units for the UI; dollar values stay
  // "$—" until the owner approves product prices.
  pendingCommissionCount: number;
  approvedCommissionCount: number;
  paidOutCount: number;
  state: AffiliateState;
  // Self-serve payout settings — set by the affiliate on /affiliate/payout.
  // Both are optional until the affiliate fills them in; without them
  // they can't open a withdrawal request.
  payoutMethod?: PayoutMethodKind;
  // Free-text destination (bank account, PayPal email, Wise handle).
  // We never render this in any public surface — only to the affiliate
  // on their own dashboard and to admins on the payout drawer.
  payoutDetails?: string;
  payoutUpdatedISO?: string;
  // Manual commission-rate override (James, 2026-10-22). When set,
  // takes precedence over the auto-tier for NEW attributions. Historical
  // snapshots are never adjusted retroactively.
  customRatePct?: number;
  customRateSetISO?: string;
  customRateSetByAdminId?: string;
};

export const SAMPLE_AFFILIATES: SampleAffiliate[] = [
  {
    code: "POSTER-247",
    firstName: "Benjamin",
    lastName: "Osei",
    email: "benjamin@osei.co",
    joinedISO: "2026-09-02T10:14:00Z",
    tier: "Gold",
    tierRatePct: 15,
    eligibleSales: 218,
    pendingOrders: 42,
    pendingCommissionCount: 42,
    approvedCommissionCount: 176,
    paidOutCount: 0,
    state: "active",
  },
  {
    code: "ROYAL-012",
    firstName: "Harriet",
    lastName: "Lin",
    email: "harriet@royalgamesociety.org",
    joinedISO: "2026-09-18T12:04:00Z",
    tier: "Silver",
    tierRatePct: 10,
    eligibleSales: 64,
    pendingOrders: 11,
    pendingCommissionCount: 11,
    approvedCommissionCount: 53,
    paidOutCount: 0,
    state: "active",
  },
  {
    code: "KINGDOM-034",
    firstName: "Oluchi",
    lastName: "Okafor",
    email: "oluchi@okafor.ng",
    joinedISO: "2026-10-04T07:30:00Z",
    tier: "Starter",
    tierRatePct: 5,
    eligibleSales: 14,
    pendingOrders: 4,
    pendingCommissionCount: 4,
    approvedCommissionCount: 10,
    paidOutCount: 0,
    state: "active",
  },
  {
    code: "SOV-001",
    firstName: "Marion",
    lastName: "Clarke",
    email: "marion.clarke@gmail.com",
    joinedISO: "2026-10-15T08:12:00Z",
    tier: "Starter",
    tierRatePct: 5,
    eligibleSales: 0,
    pendingOrders: 0,
    pendingCommissionCount: 0,
    approvedCommissionCount: 0,
    paidOutCount: 0,
    state: "pending",
  },
  {
    code: "SOV-002",
    firstName: "Sam",
    lastName: "Turner",
    email: "sam.turner@mail.com",
    joinedISO: "2026-10-14T13:17:00Z",
    tier: "Starter",
    tierRatePct: 5,
    eligibleSales: 0,
    pendingOrders: 0,
    pendingCommissionCount: 0,
    approvedCommissionCount: 0,
    paidOutCount: 0,
    state: "pending",
  },
  {
    code: "ROYAL-007",
    firstName: "Kingsley",
    lastName: "Hamid",
    email: "kingsley.hamid@gmail.com",
    joinedISO: "2026-08-21T09:22:00Z",
    tier: "Silver",
    tierRatePct: 10,
    eligibleSales: 73,
    pendingOrders: 0,
    pendingCommissionCount: 0,
    approvedCommissionCount: 73,
    paidOutCount: 0,
    state: "suspended",
  },
];

export const AFF_STATE_META: Record<
  AffiliateState,
  { label: string; tone: "ok" | "warn" | "crim" }
> = {
  active: { label: "Active", tone: "ok" },
  pending: { label: "Pending", tone: "warn" },
  suspended: { label: "Suspended", tone: "crim" },
};

export function fullName(a: SampleAffiliate): string {
  return `${a.firstName} ${a.lastName}`;
}
