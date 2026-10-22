// Stripe adapter boundary. Everything in the admin finance view talks to
// a `StripeAdapter` instead of the Stripe SDK directly, so a real
// implementation can be swapped in without touching the dashboard code.
//
// The current build ships a `MockStripeAdapter` that returns a
// deterministic sample set with one intentional orphan charge and one
// pending refund — the reconciliation engine should surface both.

export type StripeTxType = "charge" | "refund" | "payout";

export type StripeTx = {
  id: string;
  type: StripeTxType;
  // Signed amount in minor units (cents). Charges and donations are
  // positive, refunds and payouts are negative.
  amountMinor: number;
  currency: "USD";
  createdISO: string;
  description: string;
  // Order ref the merchant stashed in Stripe metadata. Missing on
  // orphans; also missing on affiliate payouts.
  orderRef?: string;
  // Only used by `refund` events — the charge the refund belongs to.
  refundedChargeId?: string;
  // Only used by `payout` events — a payout confirmation reference.
  payoutRef?: string;
  // Whether the backend has reconciled this item yet. Mocks start true
  // for the matched set and false for the two intentional exceptions.
  reconciled: boolean;
};

export interface StripeAdapter {
  // List transactions for the given period. `from` is inclusive, `to`
  // exclusive. Real implementations should paginate.
  listTransactions(opts: { from: Date; to: Date }): Promise<StripeTx[]>;
}

export class MockStripeAdapter implements StripeAdapter {
  async listTransactions({ from, to }: { from: Date; to: Date }): Promise<StripeTx[]> {
    const fromISO = from.toISOString();
    const toISO = to.toISOString();
    return SAMPLE_STRIPE_TX.filter(
      (t) => t.createdISO >= fromISO && t.createdISO < toISO,
    );
  }
}

// Returns the active adapter for the server. When STRIPE_SECRET_KEY is
// set the live RealStripeAdapter runs and talks to the real Stripe API;
// otherwise the MockStripeAdapter returns the deterministic sample set.
// Either way the finance dashboard code is unchanged.
export function getStripeAdapter(): StripeAdapter {
  if (process.env.STRIPE_SECRET_KEY) return new RealStripeAdapter();
  return new MockStripeAdapter();
}

// Live adapter — paginates payment intents + refunds + payouts from
// Stripe for the requested window. Shape-converts into the StripeTx
// type the reconciliation engine already consumes.
export class RealStripeAdapter implements StripeAdapter {
  async listTransactions({
    from,
    to,
  }: {
    from: Date;
    to: Date;
  }): Promise<StripeTx[]> {
    // Dynamic import so this file stays importable in environments
    // without the Stripe secret.
    const { getStripe } = await import("@/lib/stripe/server");
    const stripe = await getStripe();
    if (!stripe) return [];

    const fromSec = Math.floor(from.getTime() / 1000);
    const toSec = Math.floor(to.getTime() / 1000);

    // Ignore list — one-off Stripe transaction IDs we want hidden from
    // the finance view and reconciliation. Comma-separated env var;
    // matches payment intents (pi_), charges (ch_), refunds (re_) and
    // payouts (po_). Set STRIPE_FINANCE_IGNORE_IDS in .env.local or
    // Vercel. Case-insensitive, trims whitespace.
    const ignore = new Set(
      (process.env.STRIPE_FINANCE_IGNORE_IDS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
    const skip = (id: string) => ignore.has(id.toLowerCase());

    const out: StripeTx[] = [];

    // Payment intents (charges)
    for await (const pi of stripe.paymentIntents.list({
      created: { gte: fromSec, lt: toSec },
      limit: 100,
    })) {
      if (skip(pi.id)) continue;
      out.push({
        id: pi.id,
        type: "charge",
        amountMinor: pi.amount_received > 0 ? pi.amount_received : pi.amount,
        currency: pi.currency.toUpperCase() as "USD",
        createdISO: new Date(pi.created * 1000).toISOString(),
        description:
          pi.description ??
          (pi.metadata?.origin === "wholesale"
            ? "Sales · Wholesale"
            : "Sales · Early Bird"),
        orderRef:
          (pi.metadata && (pi.metadata.orderRef as string | undefined)) ||
          undefined,
        reconciled: pi.status === "succeeded",
      });
    }

    // Refunds
    for await (const r of stripe.refunds.list({
      created: { gte: fromSec, lt: toSec },
      limit: 100,
    })) {
      if (skip(r.id)) continue;
      out.push({
        id: r.id,
        type: "refund",
        amountMinor: -r.amount,
        currency: r.currency.toUpperCase() as "USD",
        createdISO: new Date(r.created * 1000).toISOString(),
        description: "Refunds",
        refundedChargeId:
          typeof r.payment_intent === "string" ? r.payment_intent : undefined,
        reconciled: r.status === "succeeded",
      });
    }

    // Payouts
    for await (const p of stripe.payouts.list({
      created: { gte: fromSec, lt: toSec },
      limit: 100,
    })) {
      if (skip(p.id)) continue;
      out.push({
        id: p.id,
        type: "payout",
        amountMinor: -p.amount,
        currency: p.currency.toUpperCase() as "USD",
        createdISO: new Date(p.created * 1000).toISOString(),
        description: `Payout · ${p.destination ?? ""}`,
        payoutRef: p.statement_descriptor ?? p.id,
        reconciled: p.status === "paid",
      });
    }

    return out;
  }
}

// Sample Stripe-sourced transactions for the design pass. Amounts stay
// $— on the dashboard until the product price approval lands; the one
// expense entry below is a real signed value so the Expenses KPI tile
// has something to anchor to. The reconciliation engine deliberately
// finds one orphan charge (`ch_3Porphan821`) and one pending refund
// (`re_pending019`).
export const SAMPLE_STRIPE_TX: StripeTx[] = [
  {
    id: "ch_3Pconfirmed218",
    type: "charge",
    amountMinor: 0, // price pending — kept at zero so UI shows $—
    currency: "USD",
    createdISO: "2026-09-29T06:48:00Z",
    description: "Sales · Early Bird",
    orderRef: "SOK-004218",
    reconciled: true,
  },
  {
    id: "ch_3Pdonation118",
    type: "charge",
    amountMinor: 0,
    currency: "USD",
    createdISO: "2026-09-28T10:03:00Z",
    description: "Donations",
    reconciled: true,
  },
  {
    id: "re_pending019",
    type: "refund",
    amountMinor: 0,
    currency: "USD",
    createdISO: "2026-09-28T12:14:00Z",
    description: "Refunds",
    orderRef: "SOK-004193",
    refundedChargeId: "ch_3Pconfirmed193",
    reconciled: false,
  },
  {
    id: "po_scheduled007",
    type: "payout",
    amountMinor: 0,
    currency: "USD",
    createdISO: "2026-09-27T16:21:00Z",
    description: "Affiliate payout",
    payoutRef: "PAY-00007",
    reconciled: false,
  },
  {
    id: "ch_3Pwholesale210",
    type: "charge",
    amountMinor: 0,
    currency: "USD",
    createdISO: "2026-09-24T10:03:00Z",
    description: "Sales · Wholesale",
    orderRef: "SOK-004210",
    reconciled: true,
  },
  {
    id: "ch_3Porphan821",
    type: "charge",
    amountMinor: 0,
    currency: "USD",
    createdISO: "2026-09-22T08:17:00Z",
    description: "Sales · Early Bird (metadata missing)",
    // No orderRef — the reconciliation engine surfaces this as an orphan.
    reconciled: false,
  },
];
