"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import ExpenseEntryDrawer, { ExpenseFormValues } from "./ExpenseEntryDrawer";
import type { ReconItem as RawReconItem, ReconResult } from "@/lib/finance/reconcile";
import type { ClosedMonth } from "@/lib/store/finance-store";
import {
  closeMonthAction,
  recordExpenseAction,
  reopenMonthAction,
} from "@/app/admin/finance/actions";

export type TxCategory =
  | "sales-early-bird"
  | "sales-wholesale"
  | "donations"
  | "refunds"
  | "expenses"
  | "payouts";

export type TxRow = {
  dateISO: string;
  ref: string;
  category: TxCategory;
  label: string;
  amountDisplay: string; // "$—" when source is price-pending; else a tabular string
  amount?: number; // signed numeric when known (negative for expenses, refunds, payouts)
  signed?: "neg" | "pos";
  source: "stripe" | "manual";
  receiptName?: string;
};

const EXPENSE_CATEGORIES = [
  "Shipping",
  "Printing",
  "Marketing",
  "Platform fees",
  "Software",
  "Travel",
  "Office",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export { EXPENSE_CATEGORIES };

// Sample transactions for the design pass. Most are "$—" because product
// prices remain unapproved; one real expense gives the dashboard a non-zero
// value to anchor layout.
const INITIAL_TX: TxRow[] = [
  {
    dateISO: "2026-09-29",
    ref: "SOK-004218",
    category: "sales-early-bird",
    label: "Sales · Early Bird",
    amountDisplay: "$—",
    signed: "pos",
    source: "stripe",
  },
  {
    dateISO: "2026-09-29",
    ref: "EXP-00412",
    category: "expenses",
    label: "Expenses · Shipping",
    amountDisplay: "− $214.80",
    amount: -214.8,
    signed: "neg",
    source: "manual",
    receiptName: "DHL-041-receipt.pdf",
  },
  {
    dateISO: "2026-09-28",
    ref: "DON-00118",
    category: "donations",
    label: "Donations",
    amountDisplay: "$—",
    signed: "pos",
    source: "stripe",
  },
  {
    dateISO: "2026-09-28",
    ref: "REF-00019",
    category: "refunds",
    label: "Refunds",
    amountDisplay: "− $—",
    signed: "neg",
    source: "stripe",
  },
  {
    dateISO: "2026-09-27",
    ref: "PAY-00007",
    category: "payouts",
    label: "Affiliate payout",
    amountDisplay: "− $—",
    signed: "neg",
    source: "manual",
  },
  {
    dateISO: "2026-09-24",
    ref: "SOK-004210",
    category: "sales-wholesale",
    label: "Sales · Wholesale",
    amountDisplay: "$—",
    signed: "pos",
    source: "stripe",
  },
];

type Filter = "all" | "sales" | "donations" | "refunds" | "expenses";

const Head = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  color: #f5f0e8;
  margin: 0 0 4px;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: #a89880;
  margin: 0;
`;

const SubChip = styled.span`
  display: inline-block;
  background: rgba(224, 169, 74, 0.14);
  color: #e0a94a;
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 3px;
  margin-left: 8px;
  vertical-align: middle;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const Period = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #0e0c09;
  border: 1px solid #2e2618;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #f5f0e8;
  cursor: pointer;

  &:hover {
    border-color: #c9a227;
  }
`;

const BtnSec = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const BtnPrimary = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    box-shadow: 0 0 20px rgba(240, 192, 64, 0.25);
  }
`;

const KPIs = styled.section`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Kpi = styled.div<{ $stale?: boolean }>`
  background: #0e0c09;
  border: 1px solid ${(p) => (p.$stale ? "#e0a94a" : "#1e1a12")};
  border-radius: 10px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;

  ${(p) =>
    p.$stale &&
    `&::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #e0a94a; }`}
`;

const KpiK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const KpiV = styled.div<{ $muted?: boolean }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.3rem;
  font-weight: 800;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
  margin: 8px 0 2px;
  font-variant-numeric: tabular-nums;
`;

const KpiD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  color: #a89880;
`;

const KpiSpark = styled.svg`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 50px;
  height: 18px;
  opacity: 0.5;
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CardHead = styled.header`
  padding: 14px 18px;
  border-bottom: 1px solid #1e1a12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CardTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1rem;
  color: #f5f0e8;
  margin: 0;
  font-weight: 700;
`;

const Filters = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const F = styled.button<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  background: ${(p) => (p.$on ? "rgba(201,162,39,0.14)" : "#1a1612")};
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  border: 1px solid ${(p) => (p.$on ? "#c9a227" : "#1e1a12")};

  &:hover {
    color: #f5f0e8;
  }
`;

const TxCardList = styled.ul`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    padding: 12px;
    margin: 0;
    background: #0a0a0a;
  }
`;

const TxCard = styled.li`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TxCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
`;

const TxCardWhen = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 700;
`;

const TxCardRef = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: #f5f0e8;
  word-break: break-all;
  text-align: right;
  min-width: 0;
`;

const TxCardCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: #f5f0e8;
`;

const TxCardFoot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #1a1510;
`;

const TableWrap = styled.div`
  overflow-x: auto;

  /* Hand off to the stacked card list on phones. */
  @media (max-width: 720px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  min-width: 520px;

  thead th {
    text-align: left;
    padding: 10px 18px;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    background: #1a1612;
  }

  tbody td {
    padding: 11px 18px;
    border-top: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }

  tbody tr:hover td {
    background: #140f0a;
  }
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
`;

const CatCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const CatDot = styled.span<{ $tone: TxCategory }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${(p) =>
    p.$tone.startsWith("sales")
      ? "#c9a227"
      : p.$tone === "donations"
      ? "#4c7ce0"
      : p.$tone === "refunds"
      ? "#c62b44"
      : p.$tone === "expenses"
      ? "#e0a94a"
      : "#4fb07d"};
`;

const Right = styled.td`
  text-align: right;
`;

const Amount = styled.span<{ $signed?: "neg" | "pos" }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: ${(p) => (p.$signed === "neg" ? "#ff6b7a" : "#f5f0e8")};
`;

const SourceCell = styled.span<{ $src: "stripe" | "manual" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
  background: ${(p) =>
    p.$src === "stripe" ? "rgba(76,124,224,0.12)" : "#1a1612"};
  color: ${(p) => (p.$src === "stripe" ? "#7fa3ff" : "#a89880")};
`;

const Recon = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReconItem = styled.div<{ $tone: "warn" | "ok" }>`
  padding: 10px 12px;
  border-radius: 4px;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  line-height: 1.5;
  border-left: 3px solid
    ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#e0a94a")};
  background: ${(p) =>
    p.$tone === "ok"
      ? "rgba(79,176,125,0.08)"
      : "rgba(224,169,74,0.08)"};
  color: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#f5f0e8")};

  strong {
    color: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#e0a94a")};
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 800;
  }
`;

const Fresh = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px;
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #a89880;
`;

const FreshDot = styled.span<{ $tone: "ok" | "warn" }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#e0a94a")};
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
`;

const Audit = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #5a4a38;
  line-height: 1.55;
  margin: 20px 0 0;
  padding-top: 16px;
  border-top: 1px solid #1e1a12;
`;

function matches(c: TxCategory, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "sales") return c === "sales-early-bird" || c === "sales-wholesale";
  if (f === "donations") return c === "donations";
  if (f === "refunds") return c === "refunds";
  if (f === "expenses") return c === "expenses";
  return true;
}

export type CommissionSummary = {
  // Dollar sum (as a positive number) of eligible commissions sitting
  // unpaid — this is what the Finance KPI shows.
  eligibleTotal: number;
  eligibleCount: number;
  paidOutTotal: number;
  paidOutCount: number;
};

export default function FinanceDashboard({
  initialTx,
  reconciliation,
  periodYear,
  periodMonth,
  periodLabel,
  closedForPeriod,
  closedMonths,
  commissions = {
    eligibleTotal: 0,
    eligibleCount: 0,
    paidOutTotal: 0,
    paidOutCount: 0,
  },
}: {
  // Transactions pulled from the Stripe adapter (plus any seed rows) on
  // the server. The expense entry drawer appends to this list client-side
  // until expense persistence is wired.
  initialTx: TxRow[];
  reconciliation: ReconResult;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;
  closedForPeriod: ClosedMonth | null;
  closedMonths: ClosedMonth[];
  commissions?: CommissionSummary;
}) {
  const commissionsTotal = commissions.eligibleTotal;
  const commissionsEligibleCount = commissions.eligibleCount;
  const commissionsPaidOutCount = commissions.paidOutCount;
  const [filter, setFilter] = useState<Filter>("all");
  const [tx, setTx] = useState<TxRow[]>(initialTx);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [, startTransition] = useTransition();

  const rows = useMemo(() => tx.filter((r) => matches(r.category, filter)), [tx, filter]);
  const counts = useMemo(() => {
    return {
      all: tx.length,
      sales: tx.filter((r) => matches(r.category, "sales")).length,
      donations: tx.filter((r) => matches(r.category, "donations")).length,
      refunds: tx.filter((r) => matches(r.category, "refunds")).length,
      expenses: tx.filter((r) => matches(r.category, "expenses")).length,
    };
  }, [tx]);

  // Sum of all known expense amounts (negative numbers), displayed as a
  // positive dollar figure in the KPI tile.
  const expensesTotal = useMemo(() => {
    return tx
      .filter((r) => r.category === "expenses" && typeof r.amount === "number")
      .reduce((n, r) => n + Math.abs(r.amount ?? 0), 0);
  }, [tx]);
  const expensesCount = tx.filter((r) => r.category === "expenses").length;

  // Headline money totals from the real transaction stream — every
  // amount is in dollars (already divided from Stripe's minor units).
  // Rows without an `amount` (price pending) are skipped so revenue
  // reflects only confirmed charges.
  const kpis = useMemo(() => {
    const sumBy = (predicate: (r: TxRow) => boolean) =>
      tx
        .filter((r) => predicate(r) && typeof r.amount === "number")
        .reduce((n, r) => n + Math.abs(r.amount ?? 0), 0);
    return {
      revenue: sumBy(
        (r) =>
          r.category === "sales-early-bird" ||
          r.category === "sales-wholesale",
      ),
      refunds: sumBy((r) => r.category === "refunds"),
      donations: sumBy((r) => r.category === "donations"),
      payouts: sumBy((r) => r.category === "payouts"),
    };
  }, [tx]);
  const salesCount = useMemo(
    () =>
      tx.filter(
        (r) =>
          r.category === "sales-early-bird" ||
          r.category === "sales-wholesale",
      ).length,
    [tx],
  );
  const refundCount = useMemo(
    () => tx.filter((r) => r.category === "refunds").length,
    [tx],
  );
  const donationCount = useMemo(
    () => tx.filter((r) => r.category === "donations").length,
    [tx],
  );
  const payoutCount = useMemo(
    () => tx.filter((r) => r.category === "payouts").length,
    [tx],
  );
  const fmt = (n: number) =>
    n === 0 ? "$—" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const nextExpenseRef = () => {
    const existing = tx
      .filter((r) => r.ref.startsWith("EXP-"))
      .map((r) => Number.parseInt(r.ref.slice(4), 10))
      .filter((n) => Number.isFinite(n));
    const max = existing.length ? Math.max(...existing) : 412;
    return `EXP-${String(max + 1).padStart(5, "0")}`;
  };

  const addExpense = (v: ExpenseFormValues) => {
    const amount = Number.parseFloat(v.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    // Optimistic row for the dashboard — gets a real ref once the
    // server action returns.
    const tempRef = nextExpenseRef();
    const optimistic: TxRow = {
      dateISO: v.dateISO,
      ref: tempRef,
      category: "expenses",
      label: `Expenses · ${v.category}`,
      amountDisplay: `− $${amount.toFixed(2)}`,
      amount: -amount,
      signed: "neg",
      source: "manual",
      receiptName: v.receiptName || undefined,
    };
    setTx((prev) => [optimistic, ...prev]);
    setDrawerOpen(false);
    startTransition(async () => {
      const result = await recordExpenseAction({
        dateISO: v.dateISO,
        vendor: v.vendor,
        description: v.description,
        category: v.category,
        amount,
        currency: v.currency,
        receiptName: v.receiptName || undefined,
      });
      if (!result.ok) {
        // Roll back the optimistic row on failure.
        setTx((prev) => prev.filter((r) => r.ref !== tempRef));
        return;
      }
      // Replace temp ref with real ref so a page refresh matches.
      setTx((prev) =>
        prev.map((r) =>
          r.ref === tempRef ? { ...r, ref: result.expense.ref } : r,
        ),
      );
    });
  };

  return (
    <>
      <Head>
        <div>
          <Title>Finance</Title>
          <Sub>
            {periodLabel} · All amounts in USD
            {closedForPeriod ? (
              <SubChip style={{ background: "rgba(79,176,125,0.14)", color: "#4fb07d" }}>
                Closed
              </SubChip>
            ) : (
              <SubChip>Reconciling</SubChip>
            )}
          </Sub>
        </div>
        <Actions>
          <Period type="button" aria-label={`Period · ${periodLabel}`}>
            {periodLabel}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2 4l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Period>
          <BtnSec type="button" onClick={() => exportCsv(tx)}>
            Export CSV
          </BtnSec>
          <BtnSec type="button" onClick={() => openPrintWindow(tx, periodLabel)}>
            Export PDF
          </BtnSec>
          <BtnPrimary type="button" onClick={() => setDrawerOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M6 2v8M2 6h8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Add expense
          </BtnPrimary>
        </Actions>
      </Head>

      <KPIs aria-label="Headline figures">
        <Kpi>
          <KpiK>Revenue</KpiK>
          <KpiV $muted={kpis.revenue === 0}>{fmt(kpis.revenue)}</KpiV>
          <KpiD>
            {salesCount === 0
              ? "No sales yet"
              : `${salesCount} order${salesCount === 1 ? "" : "s"} this period`}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,13 10,11 20,8 30,10 40,6 50,3"
              stroke="#c9a227"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi>
          <KpiK>Refunds</KpiK>
          <KpiV $muted={kpis.refunds === 0}>
            {kpis.refunds === 0 ? "$—" : `− ${fmt(kpis.refunds)}`}
          </KpiV>
          <KpiD>
            {refundCount === 0
              ? "No refunds this period"
              : `${refundCount} refund${refundCount === 1 ? "" : "s"}`}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,15 10,14 20,15 30,13 40,14 50,13"
              stroke="#c62b44"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi>
          <KpiK>Donations</KpiK>
          <KpiV $muted={kpis.donations === 0}>{fmt(kpis.donations)}</KpiV>
          <KpiD>
            {donationCount === 0
              ? "No donations this period"
              : `${donationCount} gift${donationCount === 1 ? "" : "s"}`}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,13 10,12 20,13 30,9 40,8 50,6"
              stroke="#4c7ce0"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi $stale={expensesTotal > 0}>
          <KpiK>Expenses</KpiK>
          <KpiV $muted={expensesTotal === 0}>
            {expensesTotal === 0 ? "$—" : `$${expensesTotal.toFixed(2)}`}
          </KpiV>
          <KpiD>
            {expensesCount} entr{expensesCount === 1 ? "y" : "ies"} ·{" "}
            {expensesTotal > 0 ? "last sync 6h ago" : "no entries"}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,10 10,11 20,8 30,12 40,11 50,13"
              stroke="#e0a94a"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi>
          <KpiK>Commissions</KpiK>
          <KpiV $muted={commissionsTotal === 0}>{fmt(commissionsTotal)}</KpiV>
          <KpiD>
            {commissionsEligibleCount === 0
              ? "No eligible commissions"
              : `${commissionsEligibleCount} eligible · ${commissionsPaidOutCount} paid out`}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,13 10,11 20,9 30,8 40,6 50,4"
              stroke="#c9a227"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi>
          <KpiK>Payouts</KpiK>
          <KpiV $muted={kpis.payouts === 0}>
            {kpis.payouts === 0 ? "$—" : `− ${fmt(kpis.payouts)}`}
          </KpiV>
          <KpiD>
            {payoutCount === 0
              ? "No payouts this period"
              : `${payoutCount} transfer${payoutCount === 1 ? "" : "s"}`}
          </KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,12 10,12 20,11 30,11 40,8 50,6"
              stroke="#4fb07d"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
      </KPIs>

      <Split>
        <Card>
          <CardHead>
            <CardTitle>Transactions</CardTitle>
            <Filters>
              <F $on={filter === "all"} onClick={() => setFilter("all")}>
                All · {counts.all}
              </F>
              <F $on={filter === "sales"} onClick={() => setFilter("sales")}>
                Sales · {counts.sales}
              </F>
              <F $on={filter === "donations"} onClick={() => setFilter("donations")}>
                Donations · {counts.donations}
              </F>
              <F $on={filter === "refunds"} onClick={() => setFilter("refunds")}>
                Refunds · {counts.refunds}
              </F>
              <F $on={filter === "expenses"} onClick={() => setFilter("expenses")}>
                Expenses · {counts.expenses}
              </F>
            </Filters>
          </CardHead>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.ref}>
                    <td style={{ color: "#a89880" }}>
                      {new Date(r.dateISO).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <Mono>{r.ref}</Mono>
                    </td>
                    <td>
                      <CatCell>
                        <CatDot $tone={r.category} aria-hidden="true" />
                        {r.label}
                      </CatCell>
                    </td>
                    <Right>
                      <Amount $signed={r.signed}>{r.amountDisplay}</Amount>
                    </Right>
                    <td>
                      <SourceCell $src={r.source}>{r.source}</SourceCell>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>

          {/* Mobile card list — same transactions, phone-friendly layout. */}
          <TxCardList>
            {rows.map((r) => (
              <TxCard key={`m-${r.ref}`}>
                <TxCardTop>
                  <TxCardWhen>
                    {new Date(r.dateISO).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </TxCardWhen>
                  <TxCardRef>{r.ref}</TxCardRef>
                </TxCardTop>
                <TxCardCategory>
                  <CatDot $tone={r.category} aria-hidden="true" />
                  {r.label}
                </TxCardCategory>
                <TxCardFoot>
                  <SourceCell $src={r.source}>{r.source}</SourceCell>
                  <Amount $signed={r.signed}>{r.amountDisplay}</Amount>
                </TxCardFoot>
              </TxCard>
            ))}
          </TxCardList>
        </Card>

        <Card>
          <CardHead>
            <CardTitle>Reconciliation</CardTitle>
            <span
              style={{
                fontSize: "0.68rem",
                color:
                  reconciliation.items.length > 0 ? "#e0a94a" : "#4fb07d",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {reconciliation.items.length === 0
                ? "All clear"
                : `${reconciliation.items.length} open`}
            </span>
          </CardHead>
          <Recon>
            {reconciliation.items.map((item) => (
              <ReconItem key={reconKey(item)} $tone="warn">
                {renderReconLine(item)}
              </ReconItem>
            ))}
            {reconciliation.matched > 0 && (
              <ReconItem $tone="ok">
                {reconciliation.matched} charge
                {reconciliation.matched === 1 ? "" : "s"} reconciled.
              </ReconItem>
            )}
            {reconciliation.items.length === 0 &&
              reconciliation.matched === 0 && (
                <ReconItem $tone="ok">
                  No Stripe activity in this period.
                </ReconItem>
              )}
          </Recon>
        </Card>
      </Split>

      <Fresh>
        <span>
          <FreshDot $tone="ok" aria-hidden="true" />
          Stripe synced 00:12 ago
        </span>
        <span>
          <FreshDot $tone="warn" aria-hidden="true" />
          Expenses synced 6h ago
        </span>
        <BtnSec type="button" style={{ padding: "4px 12px", fontSize: "0.75rem" }}>
          Retry stale sources
        </BtnSec>
      </Fresh>

      <CloseBlock role="region" aria-label="Month-close">
        <CloseHead>
          <div>
            <CloseEye>Month-close · {periodLabel}</CloseEye>
            <CloseStatus $closed={!!closedForPeriod}>
              {closedForPeriod ? (
                <>
                  <StatusDot $tone="ok" aria-hidden="true" />
                  Closed on{" "}
                  {new Date(closedForPeriod.closedAtISO).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "short", day: "numeric" },
                  )}{" "}
                  by {closedForPeriod.closedBy}
                </>
              ) : (
                <>
                  <StatusDot $tone="warn" aria-hidden="true" />
                  Open — totals move as new transactions arrive
                </>
              )}
            </CloseStatus>
          </div>
          {closedForPeriod ? (
            confirmReopen ? (
              <div style={{ display: "flex", gap: 8 }}>
                <BtnSec
                  type="button"
                  onClick={() => setConfirmReopen(false)}
                >
                  Cancel
                </BtnSec>
                <BtnPrimary
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await reopenMonthAction(periodYear, periodMonth);
                      setConfirmReopen(false);
                    })
                  }
                >
                  Confirm re-open
                </BtnPrimary>
              </div>
            ) : (
              <BtnSec type="button" onClick={() => setConfirmReopen(true)}>
                Re-open month…
              </BtnSec>
            )
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="Optional note for the audit log"
                aria-label="Close month note"
                style={{
                  background: "#1a1612",
                  border: "1px solid #2e2618",
                  borderRadius: 6,
                  padding: "7px 10px",
                  color: "#f5f0e8",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  width: 220,
                }}
              />
              <BtnPrimary
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await closeMonthAction({
                      year: periodYear,
                      month: periodMonth,
                      closedAtISO: new Date().toISOString(),
                      closedBy: "Owner",
                      totalsMinor: snapshotTotals(tx),
                      note: closeNote.trim() || undefined,
                    });
                    setCloseNote("");
                  })
                }
              >
                Close {periodLabel}
              </BtnPrimary>
            </div>
          )}
        </CloseHead>
        {closedForPeriod?.note && (
          <ClosedNote>
            <strong>Note from close:</strong> {closedForPeriod.note}
          </ClosedNote>
        )}
        {closedMonths.length > 0 && (
          <ClosedList>
            <ClosedListH>Previously closed</ClosedListH>
            <ul>
              {closedMonths.map((m) => (
                <li key={`${m.year}-${m.month}`}>
                  <span className="k">
                    {monthLabel(m.month)} {m.year}
                  </span>
                  <span className="v">
                    closed{" "}
                    {new Date(m.closedAtISO).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    by {m.closedBy}
                  </span>
                </li>
              ))}
            </ul>
          </ClosedList>
        )}
      </CloseBlock>

      <Audit>
        This view supports reconciliation and recordkeeping. It is not a
        substitute for formal accounting or tax advice. CSV exports produce
        the real file; PDF exports open a print window. Transactions dated
        inside a closed month should carry an audit note when edited.
      </Audit>

      <ExpenseEntryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={addExpense}
      />
    </>
  );
}

// ---------- helpers kept inline so the file stays self-contained ----------

function reconKey(item: RawReconItem): string {
  if (item.kind === "unmatched-charge") return `uc:${item.chargeId}`;
  if (item.kind === "refund-pending") return `rp:${item.refundId}`;
  return `pp:${item.payoutId}`;
}

function renderReconLine(item: RawReconItem): React.ReactNode {
  if (item.kind === "unmatched-charge") {
    return (
      <>
        Unmatched Stripe charge <strong>{item.chargeId}</strong> — no SOK
        order found. Investigate.
      </>
    );
  }
  if (item.kind === "refund-pending") {
    return (
      <>
        Refund <strong>{item.refundId}</strong>
        {item.orderRef ? (
          <>
            {" "}
            for order <strong>{item.orderRef}</strong>
          </>
        ) : null}{" "}
        expected on Stripe — not yet confirmed.
      </>
    );
  }
  return (
    <>
      Payout{" "}
      <strong>{item.payoutRef ?? item.payoutId}</strong> — awaiting bank
      confirmation.
    </>
  );
}

function monthLabel(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
  });
}

function snapshotTotals(rows: TxRow[]) {
  const sum = (predicate: (r: TxRow) => boolean) =>
    rows
      .filter(predicate)
      .reduce((n, r) => n + (typeof r.amount === "number" ? r.amount : 0), 0);
  return {
    revenue: Math.round(100 * sum((r) => r.category.startsWith("sales"))),
    refunds: Math.round(100 * sum((r) => r.category === "refunds")),
    donations: Math.round(100 * sum((r) => r.category === "donations")),
    expenses: Math.round(100 * sum((r) => r.category === "expenses")),
  };
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportCsv(rows: TxRow[]) {
  const header = ["Date", "Reference", "Category", "Label", "Amount", "Source"];
  const body = rows
    .slice()
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
    .map((r) => [
      r.dateISO,
      r.ref,
      r.category,
      r.label,
      typeof r.amount === "number" ? r.amount.toFixed(2) : r.amountDisplay,
      r.source,
    ]);
  const csv = [header, ...body].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `sok-finance-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openPrintWindow(rows: TxRow[], periodLabel: string) {
  const win = window.open("", "_blank", "width=1000,height=1100");
  if (!win) return;
  const now = new Date().toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
  const bodyRows = rows
    .slice()
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(
          new Date(r.dateISO).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        )}</td>
        <td class="mono">${escapeHtml(r.ref)}</td>
        <td>${escapeHtml(r.label)}</td>
        <td class="right ${r.signed === "neg" ? "neg" : ""}">${escapeHtml(
          r.amountDisplay,
        )}</td>
        <td>${escapeHtml(r.source)}</td>
      </tr>
    `,
    )
    .join("");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Finance · ${escapeHtml(periodLabel)}</title>
  <style>
    body { margin: 0; padding: 24px; font-family: 'Inter', Arial, sans-serif; background: #f6f1e6; color: #15110A; }
    .page { max-width: 920px; margin: 0 auto; background: #fff; padding: 32px; border: 1px solid #B8912A; }
    .mast { font-family: Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #9C7A1E; text-align: center; margin: 0 0 4px; }
    .sub { text-align: center; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4232; margin: 0 0 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; background: #f6f1e6; border-bottom: 1px solid #d9cfae; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #7A6F57; }
    td { padding: 10px 12px; border-bottom: 1px solid #e8e2d0; vertical-align: middle; }
    .mono { font-family: 'SF Mono', Menlo, Consolas, monospace; font-weight: 600; }
    .right { text-align: right; font-family: 'SF Mono', Menlo, Consolas, monospace; font-weight: 700; }
    .neg { color: #c62b44; }
    .foot { margin-top: 24px; font-size: 11px; color: #4A4232; }
    .toolbar { max-width: 920px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; }
    .btn { background: linear-gradient(135deg, #b8901e, #f0c040, #b8901e); color: #0a0a0a; border: 0; padding: 10px 18px; border-radius: 6px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-family: Georgia, serif; font-size: 13px; cursor: pointer; }
    @media print { body { padding: 0; background: #fff; } .toolbar { display: none; } .page { border: 0; padding: 0.5in; max-width: none; } @page { size: Letter; margin: 0.3in; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <strong>Finance · ${escapeHtml(periodLabel)}</strong>
    <button class="btn" onclick="window.print()">Save as PDF / Print</button>
  </div>
  <main class="page">
    <h1 class="mast">Sphere of Kings</h1>
    <p class="sub">Finance report · ${escapeHtml(periodLabel)} · Printed ${escapeHtml(now)}</p>
    <table>
      <thead><tr><th>Date</th><th>Reference</th><th>Category</th><th class="right">Amount</th><th>Source</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <p class="foot">Not a substitute for formal accounting or tax advice. CSV export at /admin/finance has the raw rows.</p>
  </main>
  <script>document.querySelector(".btn")?.focus();</script>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CloseBlock = styled.section`
  margin-top: 24px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 18px;
`;

const CloseHead = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CloseEye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9a227;
  margin-bottom: 6px;
`;

const CloseStatus = styled.div<{ $closed: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: ${(p) => (p.$closed ? "#4fb07d" : "#f5f0e8")};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const StatusDot = styled.span<{ $tone: "ok" | "warn" }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => (p.$tone === "ok" ? "#4fb07d" : "#e0a94a")};
`;

const ClosedNote = styled.p`
  margin: 10px 0 0;
  padding: 8px 12px;
  background: rgba(79, 176, 125, 0.08);
  border-left: 3px solid #4fb07d;
  border-radius: 4px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;

  strong {
    color: #4fb07d;
  }
`;

const ClosedList = styled.div`
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #1e1a12;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 8px;
  }
  li {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #1a1612;
    border-radius: 6px;
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
  }
  li .k {
    color: #f5f0e8;
    font-weight: 600;
  }
  li .v {
    color: #a89880;
    font-size: 0.76rem;
  }
`;

const ClosedListH = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #a89880;
  margin-bottom: 8px;
`;
