"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import {
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

  /* Hide the table on phones — the stacked card list below takes over,
     which fits a narrow viewport without any horizontal scrolling. */
  @media (max-width: 720px) {
    display: none;
  }
`;

/* ---- Mobile stacked cards ---- */

const CardList = styled.ul`
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

const CardItem = styled.li`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const CardRefLink = styled(Link)`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  font-size: 0.95rem;
  color: #f5f0e8;
  text-decoration: none;

  &:hover {
    color: #f0c040;
  }
`;

const CardCust = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: "Inter", sans-serif;

  .n {
    color: #f5f0e8;
    font-weight: 600;
    font-size: 0.9rem;
    line-height: 1.3;
  }
  .e {
    color: #5a4a38;
    font-size: 0.72rem;
  }
`;

const CardMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const CardFoot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #1a1510;

  .total {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    font-size: 1rem;
    color: #f5f0e8;
  }
  .when {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    color: #a89880;
  }
`;

const CardItems = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
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

const KebabWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const Kebab = styled.button<{ $open?: boolean }>`
  background: ${(p) => (p.$open ? "rgba(201, 162, 39, 0.08)" : "transparent")};
  border: 1px solid ${(p) => (p.$open ? "#c9a227" : "#1e1a12")};
  color: ${(p) => (p.$open ? "#f0c040" : "#a89880")};
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 180px;
  background: #0e0c09;
  border: 1px solid #2e2618;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
  z-index: 20;
  padding: 4px;
  display: flex;
  flex-direction: column;
`;

const menuItemCss = `
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #f5f0e8;
  background: transparent;
  border: 0;
  padding: 9px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover,
  &:focus-visible {
    background: rgba(201, 162, 39, 0.08);
    color: #f0c040;
    outline: 0;
  }
`;

const MenuItem = styled.button`
  ${menuItemCss}
`;
const MenuLink = styled(Link)`
  ${menuItemCss}
`;
const MenuAnchor = styled.a`
  ${menuItemCss}
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

export default function OrderQueue({
  orders = [],
}: {
  orders?: SampleOrder[];
}) {
  const source = orders;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openRef, setOpenRef] = useState<string | null>(null);
  // One container for the whole queue (table + mobile card list). Any
  // click outside it closes the open row menu, so the handler works
  // identically on desktop and mobile.
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close the open row menu on outside click or Escape.
  useEffect(() => {
    if (!openRef) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenRef(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenRef(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openRef]);

  const copyRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
    } catch {
      // ignore — browsers without clipboard access just skip the copy
    }
    setOpenRef(null);
  };

  const counts = useMemo(() => {
    return {
      all: source.length,
      "early-bird": source.filter((o) => o.origin === "early-bird").length,
      kickstarter: source.filter((o) => o.origin === "kickstarter").length,
      wholesale: source.filter((o) => o.origin === "wholesale").length,
      attention: source.filter((o) => matchesFilter(o, "attention")).length,
    };
  }, [source]);

  const rows = source.filter((o) => matchesFilter(o, filter));

  return (
    <Card ref={containerRef}>
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
                  <RefLink href={`/admin/orders/${o.ref}`}>{o.ref}</RefLink>
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
                  <KebabWrap>
                    <Kebab
                      type="button"
                      $open={openRef === o.ref}
                      aria-label={`Actions for ${o.ref}`}
                      aria-haspopup="menu"
                      aria-expanded={openRef === o.ref}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRef((cur) => (cur === o.ref ? null : o.ref));
                      }}
                    >
                      ⋯
                    </Kebab>
                    {openRef === o.ref && (
                      <Menu role="menu" aria-label={`Actions for ${o.ref}`}>
                        <MenuLink
                          href={`/admin/orders/${o.ref}`}
                          onClick={() => setOpenRef(null)}
                        >
                          View order
                        </MenuLink>
                        <MenuLink
                          href={`/order/${o.ref}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setOpenRef(null)}
                        >
                          Customer view ↗
                        </MenuLink>
                        <MenuLink
                          href={`/admin/fulfillment?ref=${encodeURIComponent(o.ref)}`}
                          onClick={() => setOpenRef(null)}
                        >
                          Open in fulfillment
                        </MenuLink>
                        <MenuAnchor
                          href={`mailto:?subject=Order ${o.ref}`}
                          onClick={() => setOpenRef(null)}
                        >
                          Email customer
                        </MenuAnchor>
                        <MenuItem
                          type="button"
                          onClick={() => copyRef(o.ref)}
                        >
                          Copy order ref
                        </MenuItem>
                      </Menu>
                    )}
                  </KebabWrap>
                </Right>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile card list — same data, phone-friendly layout. */}
      <CardList>
        {rows.map((o) => (
          <CardItem key={`m-${o.ref}`}>
            <CardTop>
              <CardRefLink href={`/admin/orders/${o.ref}`}>
                {o.ref}
              </CardRefLink>
              <PaymentPill p={o.payment} />
            </CardTop>
            <CardCust>
              <span className="n">{o.customerName}</span>
              <span className="e">{o.customerEmailMasked}</span>
            </CardCust>
            <CardMetaRow>
              <OriginPill o={o.origin} code={o.affiliateCode} />
            </CardMetaRow>
            <CardItems>{o.itemSummary}</CardItems>
            <CardFoot>
              <div>
                <span className="total">{o.totalDisplay}</span>
                <span className="when" style={{ marginLeft: 10 }}>
                  {formatRelative(o.placedISO)}
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <FulfillmentTicks f={o.fulfillment} />
                <KebabWrap>
                  <Kebab
                    type="button"
                    $open={openRef === o.ref}
                    aria-label={`Actions for ${o.ref}`}
                    aria-haspopup="menu"
                    aria-expanded={openRef === o.ref}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenRef((cur) => (cur === o.ref ? null : o.ref));
                    }}
                  >
                    ⋯
                  </Kebab>
                  {openRef === o.ref && (
                    <Menu role="menu" aria-label={`Actions for ${o.ref}`}>
                      <MenuLink
                        href={`/admin/orders/${o.ref}`}
                        onClick={() => setOpenRef(null)}
                      >
                        View order
                      </MenuLink>
                      <MenuLink
                        href={`/order/${o.ref}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setOpenRef(null)}
                      >
                        Customer view ↗
                      </MenuLink>
                      <MenuLink
                        href={`/admin/fulfillment?ref=${encodeURIComponent(o.ref)}`}
                        onClick={() => setOpenRef(null)}
                      >
                        Open in fulfillment
                      </MenuLink>
                      <MenuAnchor
                        href={`mailto:?subject=Order ${o.ref}`}
                        onClick={() => setOpenRef(null)}
                      >
                        Email customer
                      </MenuAnchor>
                      <MenuItem type="button" onClick={() => copyRef(o.ref)}>
                        Copy order ref
                      </MenuItem>
                    </Menu>
                  )}
                </KebabWrap>
              </div>
            </CardFoot>
          </CardItem>
        ))}
      </CardList>
      <Foot>
        <span>
          Showing {rows.length} of {source.length} order
          {source.length === 1 ? "" : "s"}
        </span>
        <span>
          Totals read as <Mono>$—</Mono> while product pricing is pending.
        </span>
      </Foot>
    </Card>
  );
}
