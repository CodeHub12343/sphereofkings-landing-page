"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import {
  SampleAffiliate,
  AffiliateState,
  AFF_STATE_META,
  fullName,
} from "@/lib/sample-affiliates";
import { formatRelative } from "@/lib/sample-orders";
import {
  setAffiliateStateAction,
  payoutEligibleAction,
} from "@/app/admin/affiliates/actions";

type Filter = "all" | AffiliateState;

const Totals = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Tile = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 16px 18px;
`;

const TileK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const TileV = styled.div<{ $tone?: "warn" | "ok" | "crim" }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 10px 0 2px;
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.$tone === "warn"
      ? "#e0a94a"
      : p.$tone === "ok"
      ? "#4fb07d"
      : p.$tone === "crim"
      ? "#ff6b7a"
      : "#f5f0e8"};
`;

const TileD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  overflow: hidden;
`;

const Head = styled.header`
  padding: 16px 20px;
  border-bottom: 1px solid #1e1a12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.1rem;
    margin: 0;
    font-weight: 700;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const F = styled.button<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  background: ${(p) => (p.$on ? "rgba(201,162,39,0.14)" : "#1a1612")};
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  border: 1px solid ${(p) => (p.$on ? "#c9a227" : "#1e1a12")};

  &:hover {
    color: #f5f0e8;
  }
`;

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

const ACard = styled.li`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 2px;
  }
`;

const ATop = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;

  .label {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
  }
  .val {
    color: #f5f0e8;
    font-weight: 600;
  }
`;

const AFoot = styled.div`
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
  font-size: 0.85rem;
  min-width: 820px;

  thead th {
    text-align: left;
    padding: 10px 20px;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    background: #1a1612;
  }
  tbody td {
    padding: 13px 20px;
    border-top: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }
  tbody tr {
    cursor: pointer;
  }
  tbody tr:hover td {
    background: #140f0a;
  }
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Ava = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(
    circle at 32% 28%,
    #e7cb70 0%,
    #d4af37 25%,
    #8a6e1f 55%,
    #1a1510 90%
  );
  color: #0a0a0a;
  display: grid;
  place-items: center;
  font-family: "Cinzel", serif;
  font-weight: 800;
  font-size: 0.75rem;
`;

const NameBody = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Name = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  color: #f5f0e8;
`;

const Code = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  color: #a89880;
`;

const Tier = styled.span`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #f0c040;
  font-size: 0.95rem;
`;

const Rate = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.72rem;
  color: #a89880;
  margin-left: 6px;
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
`;

const Pill = styled.span<{ $tone: "ok" | "warn" | "crim" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  ${(p) => {
    if (p.$tone === "ok")
      return "background: rgba(79,176,125,0.14); color: #4fb07d;";
    if (p.$tone === "warn")
      return "background: rgba(224,169,74,0.14); color: #e0a94a;";
    return "background: rgba(185,28,28,0.14); color: #ff6b7a;";
  }}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const Right = styled.td`
  text-align: right;
`;

const When = styled.span`
  color: #a89880;
  font-size: 0.78rem;
`;

const Foot = styled.footer`
  padding: 12px 20px;
  border-top: 1px solid #1e1a12;
  background: #0a0a0a;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const Scrim = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(500px, 100vw);
  background: #0a0a0a;
  border-left: 1px solid #1a1510;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
  z-index: 201;
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PHead = styled.header`
  padding: 20px 22px;
  border-bottom: 1px solid #1a1510;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const PTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  .names .n {
    font-family: "Cinzel", serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #f5f0e8;
  }
  .names .c {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.78rem;
    color: #c9a227;
    margin-top: 2px;
  }
`;

const Close = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const PBody = styled.div`
  padding: 20px 22px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StateRow = styled.div`
  background: #1a1612;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const StateLabel = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GLabel = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const GVal = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  color: #f5f0e8;
  line-height: 1.55;

  a {
    color: #f0c040;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const CommGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const Comm = styled.div`
  background: #1a1612;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CommK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const CommV = styled.div<{ $tone?: "ok" | "warn" | "muted" }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.3rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.$tone === "ok"
      ? "#4fb07d"
      : p.$tone === "warn"
      ? "#e0a94a"
      : p.$tone === "muted"
      ? "#5a4a38"
      : "#f5f0e8"};
`;

const CommD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  color: #a89880;
`;

const Note = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0;
  padding: 10px 12px;
  background: rgba(224, 169, 74, 0.06);
  border-left: 3px solid #e0a94a;
  border-radius: 4px;
`;

const Actions = styled.footer`
  padding: 16px 22px;
  border-top: 1px solid #1a1510;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
`;

const Btn = styled.button<{ $tone?: "ok" | "warn" | "crim" | "ghost" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 9px 14px;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${(p) => {
    if (p.$tone === "ok")
      return "background: linear-gradient(135deg, #2f8a5a 0%, #4fb07d 50%, #2f8a5a 100%); color: #061a10; border: 0;";
    if (p.$tone === "warn")
      return "background: transparent; border: 1px solid #e0a94a; color: #e0a94a;";
    if (p.$tone === "crim")
      return "background: linear-gradient(135deg, #8a1420 0%, #c62b44 50%, #8a1420 100%); color: #fff; border: 0;";
    return "background: transparent; border: 1px solid #2e2618; color: #a89880;";
  }}

  &:hover:not(:disabled) {
    ${(p) => {
      if (p.$tone === "ok") return "box-shadow: 0 0 18px rgba(79, 176, 125, 0.3);";
      if (p.$tone === "warn") return "background: rgba(224, 169, 74, 0.08);";
      if (p.$tone === "crim") return "box-shadow: 0 0 18px rgba(198, 43, 68, 0.3);";
      return "color: #f0c040; border-color: #c9a227;";
    }}
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

function initials(a: SampleAffiliate): string {
  return `${a.firstName[0] ?? ""}${a.lastName[0] ?? ""}`.toUpperCase();
}

function matchesFilter(s: AffiliateState, f: Filter): boolean {
  if (f === "all") return true;
  return s === f;
}

type AggregateMap = Record<
  string,
  {
    code: string;
    eligibleOrders: number;
    pendingOrders: number;
    refundedOrders: number;
    eligibleUnits: number;
    eligibleCommissionMinor: number;
  }
>;

function formatMinor(minor: number): string {
  return minor === 0 ? "$—" : `$${(minor / 100).toFixed(2)}`;
}

export default function AffiliatesAdmin({
  affiliates = [],
  aggregates = {},
}: {
  affiliates?: SampleAffiliate[];
  aggregates?: AggregateMap;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [states, setStates] = useState<Record<string, AffiliateState>>(() => {
    const m: Record<string, AffiliateState> = {};
    for (const a of affiliates) m[a.code] = a.state;
    return m;
  });
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Merge each stored affiliate with its live aggregate so counts and
  // dollar amounts come from attributedOrders in Mongo rather than from
  // the record itself.
  const effective = useMemo<SampleAffiliate[]>(() => {
    return affiliates.map((a) => {
      const agg = aggregates[a.code];
      return {
        ...a,
        state: states[a.code] ?? a.state,
        eligibleSales: agg?.eligibleOrders ?? a.eligibleSales,
        pendingOrders: agg?.pendingOrders ?? a.pendingOrders,
        pendingCommissionCount: agg?.pendingOrders ?? a.pendingCommissionCount,
        approvedCommissionCount:
          agg?.eligibleOrders ?? a.approvedCommissionCount,
      };
    });
  }, [states, aggregates, affiliates]);

  const totals = useMemo(() => {
    return {
      all: effective.length,
      active: effective.filter((a) => a.state === "active").length,
      pending: effective.filter((a) => a.state === "pending").length,
      suspended: effective.filter((a) => a.state === "suspended").length,
    };
  }, [effective]);

  const rows = effective.filter((a) => matchesFilter(a.state, filter));
  const open = openCode ? effective.find((a) => a.code === openCode) ?? null : null;

  useEffect(() => {
    if (!openCode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCode(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openCode]);

  const setAffState = (code: string, next: AffiliateState) => {
    // Optimistic UI — flip the row immediately, then persist via the
    // server action. If the write fails, nothing fancy happens; the
    // next full load reflects what's really in Mongo.
    setStates((prev) => ({ ...prev, [code]: next }));
    startTransition(async () => {
      await setAffiliateStateAction(code, next).catch(() => {});
    });
  };

  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);
  const runPayout = (code: string, eligibleMinor: number) => {
    if (eligibleMinor <= 0) return;
    const dollars = (eligibleMinor / 100).toFixed(2);
    const confirmed = window.confirm(
      `Mark all eligible commissions ($${dollars}) as paid out to ${code}?\n\nThis records the payout in the audit log. Pay the affiliate out-of-band first (bank transfer, Wise, PayPal) and keep the reference handy for the next prompt.`,
    );
    if (!confirmed) return;
    const method = (window.prompt(
      "Payout method — one of: bank, wise, paypal, other",
      "bank",
    ) ?? "").trim().toLowerCase();
    if (!["bank", "wise", "paypal", "other"].includes(method)) {
      setPayoutMsg("Payout cancelled — unrecognised method.");
      return;
    }
    const reference = (window.prompt(
      "Reference (optional) — transfer id / PayPal txn / cheque number",
      "",
    ) ?? "").trim();
    startTransition(async () => {
      const res = await payoutEligibleAction(
        code,
        method as "bank" | "wise" | "paypal" | "other",
        reference || undefined,
      );
      if (!res.ok) {
        setPayoutMsg(`Payout failed: ${res.error}`);
      } else {
        setPayoutMsg(
          `Paid out ${res.ordersPaid} commission${res.ordersPaid === 1 ? "" : "s"} ($${(res.totalPaidMinor / 100).toFixed(2)}).`,
        );
      }
    });
  };

  return (
    <>
      <Totals aria-label="Affiliate totals">
        <Tile>
          <TileK>Total affiliates</TileK>
          <TileV>{totals.all}</TileV>
          <TileD>Sample records</TileD>
        </Tile>
        <Tile>
          <TileK>Pending apps</TileK>
          <TileV $tone="warn">{totals.pending}</TileV>
          <TileD>Awaiting your approval</TileD>
        </Tile>
        <Tile>
          <TileK>Active</TileK>
          <TileV $tone="ok">{totals.active}</TileV>
          <TileD>Attribution and payouts enabled</TileD>
        </Tile>
        <Tile>
          <TileK>Suspended</TileK>
          <TileV $tone="crim">{totals.suspended}</TileV>
          <TileD>Links disabled · records preserved</TileD>
        </Tile>
      </Totals>

      <Card>
        <Head>
          <h2>Affiliates</h2>
          <Filters role="group" aria-label="Filter affiliates">
            <F $on={filter === "all"} onClick={() => setFilter("all")}>
              All · {totals.all}
            </F>
            <F $on={filter === "pending"} onClick={() => setFilter("pending")}>
              Pending · {totals.pending}
            </F>
            <F $on={filter === "active"} onClick={() => setFilter("active")}>
              Active · {totals.active}
            </F>
            <F $on={filter === "suspended"} onClick={() => setFilter("suspended")}>
              Suspended · {totals.suspended}
            </F>
          </Filters>
        </Head>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Joined</th>
                <th>Tier</th>
                <th style={{ textAlign: "right" }}>Eligible sales</th>
                <th style={{ textAlign: "right" }}>Pending commission</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.code}
                  onClick={() => setOpenCode(a.code)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenCode(a.code);
                    }
                  }}
                >
                  <td>
                    <NameCell>
                      <Ava aria-hidden="true">{initials(a)}</Ava>
                      <NameBody>
                        <Name>{fullName(a)}</Name>
                        <Code>{a.code}</Code>
                      </NameBody>
                    </NameCell>
                  </td>
                  <td>
                    <When>{formatRelative(a.joinedISO)}</When>
                  </td>
                  <td>
                    <Tier>{a.tier}</Tier>
                    <Rate>{a.tierRatePct}%</Rate>
                  </td>
                  <Right>
                    <Mono>{a.eligibleSales}</Mono>
                  </Right>
                  <Right>
                    <Mono>
                      {a.pendingCommissionCount}{" "}
                      <span style={{ color: "#a89880", fontWeight: 500 }}>
                        orders · $—
                      </span>
                    </Mono>
                  </Right>
                  <td>
                    <Pill $tone={AFF_STATE_META[a.state].tone}>
                      <PillDot aria-hidden="true" />
                      {AFF_STATE_META[a.state].label}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>

        {/* Mobile card list — same data, phone-friendly layout. */}
        <CardList>
          {rows.map((a) => (
            <ACard
              key={`m-${a.code}`}
              tabIndex={0}
              onClick={() => setOpenCode(a.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenCode(a.code);
                }
              }}
            >
              <ATop>
                <Ava aria-hidden="true">{initials(a)}</Ava>
                <NameBody>
                  <Name>{fullName(a)}</Name>
                  <Code>{a.code}</Code>
                </NameBody>
              </ATop>
              <AMetaRow>
                <span className="label">Joined</span>
                <span className="val">{formatRelative(a.joinedISO)}</span>
              </AMetaRow>
              <AMetaRow>
                <span className="label">Tier</span>
                <span className="val">
                  <Tier>{a.tier}</Tier>
                  <Rate>{a.tierRatePct}%</Rate>
                </span>
              </AMetaRow>
              <AMetaRow>
                <span className="label">Eligible sales</span>
                <Mono>{a.eligibleSales}</Mono>
              </AMetaRow>
              <AMetaRow>
                <span className="label">Pending commission</span>
                <Mono>
                  {a.pendingCommissionCount}{" "}
                  <span style={{ color: "#a89880", fontWeight: 500 }}>
                    orders · $—
                  </span>
                </Mono>
              </AMetaRow>
              <AFoot>
                <Pill $tone={AFF_STATE_META[a.state].tone}>
                  <PillDot aria-hidden="true" />
                  {AFF_STATE_META[a.state].label}
                </Pill>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.78rem",
                    color: "#f0c040",
                    fontWeight: 700,
                  }}
                >
                  Open →
                </span>
              </AFoot>
            </ACard>
          ))}
        </CardList>
        <Foot>
          <span>
            Showing {rows.length} of {totals.all}
          </span>
          <span>
            State changes stay local — hook up the affiliate backend to
            persist decisions and send approval emails.
          </span>
        </Foot>
      </Card>

      <Scrim
        $open={openCode !== null}
        onClick={() => setOpenCode(null)}
        aria-hidden={openCode === null}
      />
      <Panel
        $open={openCode !== null}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aff-title"
        aria-hidden={openCode === null}
      >
        {open && (
          <>
            <PHead>
              <PTitle>
                <Ava aria-hidden="true" style={{ width: 44, height: 44, fontSize: "0.95rem" }}>
                  {initials(open)}
                </Ava>
                <div className="names">
                  <div className="n" id="aff-title">
                    {fullName(open)}
                  </div>
                  <div className="c">{open.code}</div>
                </div>
              </PTitle>
              <Close
                type="button"
                onClick={() => setOpenCode(null)}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </Close>
            </PHead>
            <PBody>
              <StateRow>
                <StateLabel>Current state</StateLabel>
                <Pill $tone={AFF_STATE_META[open.state].tone}>
                  <PillDot aria-hidden="true" />
                  {AFF_STATE_META[open.state].label}
                </Pill>
              </StateRow>

              <Group>
                <GLabel>Contact</GLabel>
                <GVal>
                  <a href={`mailto:${open.email}`}>{open.email}</a>
                </GVal>
              </Group>

              <Group>
                <GLabel>Tier</GLabel>
                <GVal>
                  <Tier>{open.tier}</Tier>
                  <Rate>{open.tierRatePct}%</Rate>{" "}
                  <span style={{ color: "#a89880", fontSize: "0.78rem" }}>
                    · {open.eligibleSales} eligible sales
                  </span>
                </GVal>
              </Group>

              <Group>
                <GLabel>Commission records</GLabel>
                <CommGrid>
                  <Comm>
                    <CommK>Pending</CommK>
                    <CommV $tone="warn">{open.pendingCommissionCount}</CommV>
                    <CommD>
                      orders · <Mono>$—</Mono>
                    </CommD>
                  </Comm>
                  <Comm>
                    <CommK>Approved</CommK>
                    <CommV $tone="ok">{open.approvedCommissionCount}</CommV>
                    <CommD>
                      orders ·{" "}
                      <Mono>
                        {formatMinor(
                          aggregates[open.code]?.eligibleCommissionMinor ?? 0,
                        )}
                      </Mono>
                    </CommD>
                  </Comm>
                  <Comm>
                    <CommK>Paid out</CommK>
                    <CommV $tone="muted">{open.paidOutCount}</CommV>
                    <CommD>
                      payouts · <Mono>$—</Mono>
                    </CommD>
                  </Comm>
                </CommGrid>
              </Group>

              {payoutMsg && (
                <Note style={{ borderLeftColor: "#4fb07d", color: "#4fb07d" }}>
                  {payoutMsg}
                </Note>
              )}
              <Note>
                Pay the affiliate out-of-band (bank transfer / Wise / PayPal),
                then click <strong>Record payout</strong> to flip every
                eligible commission to <Mono>paid-out</Mono> and log an audit
                event. The affiliate's dashboard reflects the change on next
                load.
              </Note>
            </PBody>
            <Actions>
              {open.state === "active" && (
                <Btn
                  $tone="crim"
                  type="button"
                  onClick={() => setAffState(open.code, "suspended")}
                >
                  Suspend
                </Btn>
              )}
              {open.state === "suspended" && (
                <Btn
                  type="button"
                  onClick={() => setAffState(open.code, "active")}
                >
                  Reactivate
                </Btn>
              )}
              {open.state === "pending" && (
                <>
                  <Btn
                    $tone="crim"
                    type="button"
                    onClick={() => setAffState(open.code, "suspended")}
                  >
                    Reject
                  </Btn>
                  <Btn
                    $tone="ok"
                    type="button"
                    onClick={() => setAffState(open.code, "active")}
                  >
                    Approve
                  </Btn>
                </>
              )}
              {open.state === "active" && (
                <Btn
                  $tone="ok"
                  type="button"
                  disabled={
                    (aggregates[open.code]?.eligibleCommissionMinor ?? 0) === 0
                  }
                  title={
                    (aggregates[open.code]?.eligibleCommissionMinor ?? 0) === 0
                      ? "No eligible commissions to pay out"
                      : undefined
                  }
                  onClick={() =>
                    runPayout(
                      open.code,
                      aggregates[open.code]?.eligibleCommissionMinor ?? 0,
                    )
                  }
                >
                  Record payout
                </Btn>
              )}
            </Actions>
          </>
        )}
      </Panel>
    </>
  );
}
