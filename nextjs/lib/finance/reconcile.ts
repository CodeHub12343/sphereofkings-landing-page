// Reconciliation engine. Pure function — no I/O. Given a set of Stripe
// transactions and the set of order refs that actually exist on our
// side, it returns a typed list of items for the admin finance view's
// reconciliation panel.
//
// The engine produces three kinds of exceptions plus a "matched" count:
//   - unmatched-charge   : a Stripe charge whose metadata order ref is
//                          absent or doesn't match any order we know
//   - refund-pending     : a refund Stripe reported that we haven't
//                          marked as settled on our side
//   - payout-pending     : a payout Stripe reported that the bank
//                          hasn't confirmed

import { StripeTx } from "@/lib/stripe/adapter";

export type ReconItem =
  | {
      kind: "unmatched-charge";
      chargeId: string;
      amountMinor: number;
      description: string;
    }
  | {
      kind: "refund-pending";
      refundId: string;
      orderRef?: string;
      refundedChargeId?: string;
    }
  | {
      kind: "payout-pending";
      payoutId: string;
      payoutRef?: string;
    };

export type ReconResult = {
  matched: number;
  items: ReconItem[];
};

export function reconcile(
  txs: StripeTx[],
  knownOrderRefs: Set<string>,
): ReconResult {
  const items: ReconItem[] = [];
  let matched = 0;

  for (const tx of txs) {
    if (tx.type === "charge") {
      if (tx.orderRef && knownOrderRefs.has(tx.orderRef)) {
        matched += 1;
      } else {
        items.push({
          kind: "unmatched-charge",
          chargeId: tx.id,
          amountMinor: tx.amountMinor,
          description: tx.description,
        });
      }
      continue;
    }
    if (tx.type === "refund") {
      if (!tx.reconciled) {
        items.push({
          kind: "refund-pending",
          refundId: tx.id,
          orderRef: tx.orderRef,
          refundedChargeId: tx.refundedChargeId,
        });
      } else {
        matched += 1;
      }
      continue;
    }
    if (tx.type === "payout") {
      if (!tx.reconciled) {
        items.push({
          kind: "payout-pending",
          payoutId: tx.id,
          payoutRef: tx.payoutRef,
        });
      } else {
        matched += 1;
      }
    }
  }

  return { matched, items };
}
