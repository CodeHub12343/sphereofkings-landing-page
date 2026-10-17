"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";

type TxCategory =
  | "sales-early-bird"
  | "sales-wholesale"
  | "donations"
  | "refunds"
  | "expenses"
  | "payouts";

type TxRow = {
  dateISO: string;
  ref: string;
  category: TxCategory;
  label: string;
  amountDisplay: string; // "$—" when source is price-pending; else a tabular string
  signed?: "neg" | "pos";
  source: "stripe" | "manual";
};

// Sample transactions for the design pass. Most are "$—" because product
// prices remain unapproved; one real expense gives the dashboard a non-zero
// value to anchor layout.
const SAMPLE_TX: TxRow[] = [
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
    signed: "neg",
    source: "manual",
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

const TableWrap = styled.div`
  overflow-x: auto;
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

export default function FinanceDashboard() {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => SAMPLE_TX.filter((r) => matches(r.category, filter)), [filter]);
  const counts = useMemo(() => {
    return {
      all: SAMPLE_TX.length,
      sales: SAMPLE_TX.filter((r) => matches(r.category, "sales")).length,
      donations: SAMPLE_TX.filter((r) => matches(r.category, "donations")).length,
      refunds: SAMPLE_TX.filter((r) => matches(r.category, "refunds")).length,
      expenses: SAMPLE_TX.filter((r) => matches(r.category, "expenses")).length,
    };
  }, []);

  return (
    <>
      <Head>
        <div>
          <Title>Finance</Title>
          <Sub>
            September 2026 · All amounts in USD
            <SubChip>Reconciling</SubChip>
          </Sub>
        </div>
        <Actions>
          <Period type="button">
            September 2026
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
          <BtnSec type="button">Export CSV</BtnSec>
          <BtnSec type="button">Export PDF</BtnSec>
        </Actions>
      </Head>

      <KPIs aria-label="Headline figures">
        <Kpi>
          <KpiK>Revenue</KpiK>
          <KpiV $muted>$—</KpiV>
          <KpiD>Pending prices</KpiD>
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
          <KpiV $muted>$—</KpiV>
          <KpiD>No charges yet</KpiD>
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
          <KpiV $muted>$—</KpiV>
          <KpiD>Stripe not wired</KpiD>
          <KpiSpark viewBox="0 0 50 18" fill="none" aria-hidden="true">
            <polyline
              points="0,13 10,12 20,13 30,9 40,8 50,6"
              stroke="#4c7ce0"
              strokeWidth="1.5"
              fill="none"
            />
          </KpiSpark>
        </Kpi>
        <Kpi $stale>
          <KpiK>Expenses</KpiK>
          <KpiV>$214.80</KpiV>
          <KpiD>1 entry · last sync 6h ago</KpiD>
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
          <KpiV $muted>$—</KpiV>
          <KpiD>Pending approval</KpiD>
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
          <KpiV $muted>$—</KpiV>
          <KpiD>1 scheduled</KpiD>
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
        </Card>

        <Card>
          <CardHead>
            <CardTitle>Reconciliation</CardTitle>
            <span style={{ fontSize: "0.68rem", color: "#e0a94a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              3 open
            </span>
          </CardHead>
          <Recon>
            <ReconItem $tone="warn">
              Unmatched Stripe charge <strong>ch_3P… 821</strong> — no SOK
              order found. Investigate.
            </ReconItem>
            <ReconItem $tone="warn">
              Refund <strong>REF-00019</strong> expected on Stripe — not yet
              confirmed.
            </ReconItem>
            <ReconItem $tone="warn">
              Payout <strong>PAY-00007</strong> — awaiting bank confirmation.
            </ReconItem>
            <ReconItem $tone="ok">14 charges reconciled.</ReconItem>
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

      <Audit>
        This view supports reconciliation and recordkeeping. It is not a
        substitute for formal accounting or tax advice. Every export is
        recorded in the audit log once the backend is wired.
      </Audit>
    </>
  );
}
