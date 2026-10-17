"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import {
  SAMPLE_ORDERS,
  SampleOrder,
  OrderOrigin,
  PaymentState,
  FulfillmentState,
  formatRelative,
} from "@/lib/sample-orders";

type FilterKey = "all" | "early-bird" | "kickstarter" | "wholesale" | "attention";

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  overflow: hidden;
`;

const Head = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #1e1a12;
  flex-wrap: wrap;

  h2 {
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #f5f0e8;
    margin: 0;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Filter = styled.button<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  background: ${(p) => (p.$on ? "rgba(201, 162, 39, 0.14)" : "#1a1612")};
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  border: 1px solid ${(p) => (p.$on ? "#c9a227" : "#1e1a12")};
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: #f5f0e8;
    border-color: #2e2618;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  min-width: 820px;

  thead th {
    text-align: left;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    background: #1a1612;
    padding: 11px 16px;
    border-top: 1px solid #1e1a12;
    border-bottom: 1px solid #1e1a12;
  }

  tbody td {
    padding: 13px 16px;
    border-bottom: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: #140f0a;
  }
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 600;
`;

const RefLink = styled(Link)`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 600;
  color: #f5f0e8;
  text-decoration: none;

  &:hover {
    color: #f0c040;
    text-decoration: underline;
  }
`;

const Cust = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  span.e {
    font-size: 0.7rem;
    color: #5a4a38;
  }
`;

const When = styled.span`
  color: #a89880;
  font-size: 0.78rem;
`;

const Right = styled.td`
  text-align: right;
`;

const Pill = styled.span<{ $tone: PillTone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;

  ${(p) => toneStyles[p.$tone]}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const AffCode = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: #a89880;
  background: #1a1612;
  padding: 2px 7px;
  border-radius: 3px;
  margin-left: 6px;
`;

const Ticks = styled.div`
  display: inline-flex;
  gap: 3px;
`;

const Tick = styled.span<{ $state: "off" | "on" | "active" }>`
  width: 22px;
  height: 6px;
  border-radius: 2px;
  background: ${(p) =>
    p.$state === "on"
      ? "#4c7ce0"
      : p.$state === "active"
      ? "#e0a94a"
      : "#1a1612"};
  border: 1px solid
    ${(p) =>
      p.$state === "on"
        ? "#4c7ce0"
        : p.$state === "active"
        ? "#e0a94a"
        : "#1e1a12"};
`;

const Kebab = styled.button`
  background: transparent;
  border: 1px solid #1e1a12;
  color: #a89880;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Foot = styled.footer`
  padding: 12px 22px;
  border-top: 1px solid #1e1a12;
  background: #0a0a0a;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

type PillTone =
  | "earlybird"
  | "kickstarter"
  | "wholesale"
  | "paid"
  | "pending"
  | "failed"
  | "refund-pending"
  | "partial"
  | "refunded";

const toneStyles: Record<PillTone, string> = {
  earlybird:
    "background: rgba(201,162,39,0.14); color: #f0c040;",
  kickstarter:
    "background: rgba(76,124,224,0.14); color: #7fa3ff;",
  wholesale:
    "background: #1a1612; color: #f5f0e8; border: 1px solid #2e2618;",
  paid: "background: rgba(79,176,125,0.14); color: #4fb07d;",
  pending: "background: rgba(224,169,74,0.14); color: #e0a94a;",
  failed: "background: rgba(185,28,28,0.14); color: #ff6b7a;",
  "refund-pending":
    "background: rgba(224,169,74,0.14); color: #e0a94a;",
  partial:
    "background: #1a1612; color: #a89880; border: 1px solid #2e2618;",
  refunded:
    "background: #1a1612; color: #5a4a38;",
};

function OriginPill({ o, code }: { o: OrderOrigin; code?: string }) {
  if (o === "early-bird") {
    return (
      <>
        <Pill $tone="earlybird">Early Bird</Pill>
        {code && <AffCode>{code}</AffCode>}
      </>
    );
  }
  if (o === "kickstarter") return <Pill $tone="kickstarter">Kickstarter</Pill>;
  return <Pill $tone="wholesale">Wholesale</Pill>;
}

function PaymentPill({ p }: { p: PaymentState }) {
  switch (p) {
    case "paid":
      return (
        <Pill $tone="paid">
          <PillDot aria-hidden="true" />
          Paid
        </Pill>
      );
    case "pending":
      return (
        <Pill $tone="pending">
          <PillDot aria-hidden="true" />
          Pending
        </Pill>
      );
    case "failed":
      return (
        <Pill $tone="failed">
          <PillDot aria-hidden="true" />
          Failed
        </Pill>
      );
    case "refund-pending":
      return <Pill $tone="refund-pending">Refund pending</Pill>;
    case "partially-refunded":
      return <Pill $tone="partial">Partial refund</Pill>;
    case "refunded":
      return <Pill $tone="refunded">Refunded</Pill>;
  }
}

function FulfillmentTicks({ f }: { f: FulfillmentState }) {
  const steps: ("off" | "on" | "active")[] =
    f === "none"
      ? ["off", "off", "off"]
      : f === "produced"
      ? ["on", "active", "off"]
      : f === "packed"
      ? ["on", "on", "active"]
      : ["on", "on", "on"];
  const labels = ["Produced", "Packed", "Dispatched"];
  const aria = `Fulfillment: ${labels
    .map((l, i) => `${l} ${steps[i] === "on" ? "done" : steps[i] === "active" ? "in progress" : "pending"}`)
    .join(", ")}`;
  return (
    <Ticks aria-label={aria}>
      {steps.map((s, i) => (
        <Tick key={i} $state={s} />
      ))}
    </Ticks>
  );
}

function matchesFilter(o: SampleOrder, f: FilterKey): boolean {
  if (f === "all") return true;
  if (f === "attention") {
    return (
      o.payment === "failed" ||
      o.payment === "refund-pending" ||
      o.payment === "pending"
    );
  }
  return o.origin === f;
}

export default function OrderQueue() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    return {
      all: SAMPLE_ORDERS.length,
      "early-bird": SAMPLE_ORDERS.filter((o) => o.origin === "early-bird").length,
      kickstarter: SAMPLE_ORDERS.filter((o) => o.origin === "kickstarter").length,
      wholesale: SAMPLE_ORDERS.filter((o) => o.origin === "wholesale").length,
      attention: SAMPLE_ORDERS.filter((o) => matchesFilter(o, "attention")).length,
    };
  }, []);

  const rows = SAMPLE_ORDERS.filter((o) => matchesFilter(o, filter));

  return (
    <Card>
      <Head>
        <h2>Order queue</h2>
        <Filters role="group" aria-label="Filter orders">
          <Filter $on={filter === "all"} onClick={() => setFilter("all")}>
            All · {counts.all}
          </Filter>
          <Filter
            $on={filter === "early-bird"}
            onClick={() => setFilter("early-bird")}
          >
            Early Bird · {counts["early-bird"]}
          </Filter>
          <Filter
            $on={filter === "kickstarter"}
            onClick={() => setFilter("kickstarter")}
          >
            Kickstarter · {counts.kickstarter}
          </Filter>
          <Filter
            $on={filter === "wholesale"}
            onClick={() => setFilter("wholesale")}
          >
            Wholesale · {counts.wholesale}
          </Filter>
          <Filter
            $on={filter === "attention"}
            onClick={() => setFilter("attention")}
          >
            Needs attention · {counts.attention}
          </Filter>
        </Filters>
      </Head>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Customer</th>
              <th>Origin</th>
              <th>Items</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.ref}>
                <td>
                  <RefLink href={`/order/${o.ref}`}>{o.ref}</RefLink>
                </td>
                <td>
                  <When>{formatRelative(o.placedISO)}</When>
                </td>
                <td>
                  <Cust>
                    <span>{o.customerName}</span>
                    <span className="e">{o.customerEmailMasked}</span>
                  </Cust>
                </td>
                <td>
                  <OriginPill o={o.origin} code={o.affiliateCode} />
                </td>
                <td style={{ color: "#a89880" }}>{o.itemSummary}</td>
                <Right>
                  <Mono>{o.totalDisplay}</Mono>
                </Right>
                <td>
                  <PaymentPill p={o.payment} />
                </td>
                <td>
                  <FulfillmentTicks f={o.fulfillment} />
                </td>
                <Right>
                  <Kebab type="button" aria-label={`Actions for ${o.ref}`}>
                    ⋯
                  </Kebab>
                </Right>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      <Foot>
        <span>
          Showing {rows.length} of {SAMPLE_ORDERS.length} sample order
          {SAMPLE_ORDERS.length === 1 ? "" : "s"}
        </span>
        <span>
          Totals read as <Mono>$—</Mono> while product pricing is pending.
        </span>
      </Foot>
    </Card>
  );
}
