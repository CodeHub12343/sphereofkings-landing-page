import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import FinanceDashboard from "@/components/admin/FinanceDashboard";
import type { TxRow, TxCategory } from "@/components/admin/FinanceDashboard";
import { getStripeAdapter, StripeTx } from "@/lib/stripe/adapter";
import { reconcile } from "@/lib/finance/reconcile";
import {
  listClosedMonths,
  findClosedMonth,
} from "@/lib/store/finance-store";
import { listExpenses, StoredExpense } from "@/lib/db/collections/expenses";
import {
  listOrdersWithSamples,
  listStoredOrders,
  StoredOrder,
} from "@/lib/db/collections/orders";
import { aggregateByAffiliate } from "@/lib/db/collections/attributed-orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finance · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ year?: string; month?: string }>;

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // Period defaults to the current UTC month so the dashboard shows
  // "now" instead of a frozen demo window. Supports ?year=&month=
  // overrides for drilling into closed/historical months.
  const sp = (await searchParams) ?? {};
  const now = new Date();
  const year = sp.year ? Number(sp.year) : now.getUTCFullYear();
  const month = sp.month ? Number(sp.month) : now.getUTCMonth() + 1;

  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));
  const periodLabel = from.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  // All sources in parallel. Each uses the Mongo-first + file
  // fallback pattern — nothing is sample data unless a store is empty.
  const [stripeTxs, allOrders, realOrders, closedMonths, closedForPeriod, storedExpenses, affAggregates] =
    await Promise.all([
      getStripeAdapter().listTransactions({ from, to }).catch(() => [] as StripeTx[]),
      listOrdersWithSamples(),
      listStoredOrders().catch(() => [] as StoredOrder[]),
      listClosedMonths().catch(() => []),
      findClosedMonth(year, month).catch(() => null),
      listExpenses().catch(() => [] as StoredExpense[]),
      aggregateByAffiliate().catch(() => ({})),
    ]);

  // Flatten the per-affiliate aggregate into the four scalars the
  // Commissions KPI needs. Dollars come from minor units.
  const commissions = Object.values(affAggregates).reduce(
    (acc, a) => {
      acc.eligibleTotal += (a.eligibleCommissionMinor ?? 0) / 100;
      acc.eligibleCount += a.eligibleOrders - a.paidOutOrders;
      acc.paidOutTotal += (a.paidOutCommissionMinor ?? 0) / 100;
      acc.paidOutCount += a.paidOutOrders ?? 0;
      return acc;
    },
    { eligibleTotal: 0, eligibleCount: 0, paidOutTotal: 0, paidOutCount: 0 },
  );

  // Reconciliation checks the Stripe charges we saw against every order
  // ref the store knows about (real + sample demos), so an unknown
  // Stripe row flags correctly as "orphan".
  const knownOrderRefs = new Set(allOrders.map((o) => o.ref));
  const reconciliation = reconcile(stripeTxs, knownOrderRefs);

  const initialTx = buildTxRows({
    stripeTxs,
    orders: allOrders,
    expenses: storedExpenses,
    from,
    to,
  });

  const hasRealData = realOrders.length > 0 || storedExpenses.length > 0;

  return (
    <section style={pageStyle}>
      <Wrap>
        {!hasRealData && <DemoBanner />}
        <FinanceDashboard
          initialTx={initialTx}
          reconciliation={reconciliation}
          periodYear={year}
          periodMonth={month}
          periodLabel={periodLabel}
          closedForPeriod={closedForPeriod ?? null}
          closedMonths={closedMonths}
          commissions={commissions}
        />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};

// Build the dashboard's TxRow list from the real sources. Priority:
//   1. Stripe transactions (authoritative when the webhook has fired)
//   2. Paid orders from Mongo that don't match a Stripe row (so revenue
//      shows even when stripe listing fails or isn't fetched yet)
//   3. Stored expenses
// No fabricated demo rows — if the store is empty, so is the list.
function buildTxRows({
  stripeTxs,
  orders,
  expenses,
  from,
  to,
}: {
  stripeTxs: StripeTx[];
  orders: StoredOrder[];
  expenses: StoredExpense[];
  from: Date;
  to: Date;
}): TxRow[] {
  const stripeRows: TxRow[] = stripeTxs.map((t) => {
    const category: TxCategory =
      t.type === "refund"
        ? "refunds"
        : t.type === "payout"
        ? "payouts"
        : t.description.toLowerCase().includes("donation")
        ? "donations"
        : t.description.toLowerCase().includes("wholesale")
        ? "sales-wholesale"
        : "sales-early-bird";
    const dollars = t.amountMinor / 100;
    const signed: "pos" | "neg" | undefined =
      t.type === "refund" || t.type === "payout" ? "neg" : "pos";
    const amountDisplay =
      dollars === 0
        ? signed === "neg"
          ? "− $—"
          : "$—"
        : signed === "neg"
        ? `− $${Math.abs(dollars).toFixed(2)}`
        : `$${dollars.toFixed(2)}`;
    return {
      dateISO: t.createdISO.slice(0, 10),
      ref: t.id.toUpperCase().replace("CH_3P", "SOK-").slice(0, 14),
      category,
      label: t.description,
      amountDisplay,
      amount: dollars === 0 ? undefined : signed === "neg" ? -Math.abs(dollars) : dollars,
      signed,
      source: "stripe",
    };
  });

  // Which refs did Stripe cover? Anything paid in Mongo that isn't in
  // that set gets its own row so the dashboard reflects the real revenue
  // even before/without a Stripe sync.
  const stripeRefSet = new Set(
    stripeTxs
      .map((t) => t.description.match(/SOK-\d{6}/)?.[0])
      .filter((r): r is string => !!r),
  );

  const paidInPeriod = orders.filter((o) => {
    if (o.payment !== "paid") return false;
    const placed = new Date(o.placedISO);
    return placed >= from && placed < to;
  });

  const orderRows: TxRow[] = paidInPeriod
    .filter((o) => !stripeRefSet.has(o.ref))
    .map((o) => {
      const dollars = (o.totalMinor ?? 0) / 100;
      const category: TxCategory =
        o.origin === "wholesale" ? "sales-wholesale" : "sales-early-bird";
      return {
        dateISO: o.placedISO.slice(0, 10),
        ref: o.ref,
        category,
        label: `Sales · ${o.origin === "wholesale" ? "Wholesale" : "Early Bird"}`,
        amountDisplay: dollars > 0 ? `$${dollars.toFixed(2)}` : "$—",
        amount: dollars > 0 ? dollars : undefined,
        signed: "pos",
        source: "stripe", // treated as revenue in the KPI even though stored locally
      };
    });

  // Only expenses dated inside the period.
  const expenseRows: TxRow[] = expenses
    .filter((e) => {
      const d = new Date(e.dateISO);
      return d >= from && d < to;
    })
    .map((e) => ({
      dateISO: e.dateISO,
      ref: e.ref,
      category: "expenses" as TxCategory,
      label: `Expenses · ${e.category}`,
      amountDisplay: `− $${e.amount.toFixed(2)}`,
      amount: -Math.abs(e.amount),
      signed: "neg",
      source: "manual",
      receiptName: e.receiptName,
    }));

  return [...stripeRows, ...orderRows, ...expenseRows].sort((a, b) =>
    a.dateISO < b.dateISO ? 1 : -1,
  );
}
