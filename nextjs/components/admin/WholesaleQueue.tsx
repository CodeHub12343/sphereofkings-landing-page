"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import {
  SampleQuote,
  QuoteState,
  QUOTE_STATE_META,
  totalUnits,
  effectiveTier,
} from "@/lib/sample-quotes";
import { formatRelative } from "@/lib/sample-orders";
import type { StoredQuote } from "@/lib/store/quotes-store";
import { wholesaleCheckoutPath } from "@/lib/wholesale-checkout";
import { decideQuoteAction } from "@/app/admin/wholesale/actions";
import WholesaleDecisionEmail, {
  DecisionEmailProps,
} from "@/components/emails/WholesaleDecision";

type Filter = "all" | QuoteState | "needs-action";

const needsActionStates: QuoteState[] = ["new", "under-review", "info-required"];

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

const TileV = styled.div<{ $tone?: "warn" | "ok" | "muted" }>`
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
      : p.$tone === "muted"
      ? "#5a4a38"
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

const RefMono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
`;

const BizCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Biz = styled.span`
  font-weight: 700;
  color: #f5f0e8;
`;

const BizContact = styled.span`
  font-size: 0.72rem;
  color: #a89880;
`;

const Pill = styled.span<{ $tone: "new" | "ok" | "warn" | "muted" | "crim" | "royal" }>`
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
  white-space: nowrap;

  ${(p) => {
    if (p.$tone === "new")
      return "background: rgba(201,162,39,0.14); color: #f0c040;";
    if (p.$tone === "ok")
      return "background: rgba(79,176,125,0.14); color: #4fb07d;";
    if (p.$tone === "warn")
      return "background: rgba(224,169,74,0.14); color: #e0a94a;";
    if (p.$tone === "crim")
      return "background: rgba(185,28,28,0.14); color: #ff6b7a;";
    if (p.$tone === "royal")
      return "background: rgba(76,124,224,0.14); color: #7fa3ff;";
    return "background: #1a1612; color: #5a4a38;";
  }}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const QuoteTier = styled.span<{ $review: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${(p) => (p.$review ? "#ff6b7a" : "#f0c040")};
`;

const Right = styled.td`
  text-align: right;
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
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
  min-width: 0;

  .ref {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    font-size: 1.1rem;
    color: #f5f0e8;
  }
  .biz {
    font-family: "Cinzel", serif;
    font-size: 0.95rem;
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
  font-size: 0.92rem;
  color: #f5f0e8;
  line-height: 1.55;
  white-space: pre-line;
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Line = styled.div`
  background: #1a1612;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  span.name {
    font-family: "Inter", sans-serif;
    color: #f5f0e8;
    font-weight: 600;
  }
  span.qty {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    color: #f0c040;
    font-weight: 700;
  }
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

function matchesFilter(s: QuoteState, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "needs-action") return needsActionStates.includes(s);
  return s === f;
}

export default function WholesaleQueue({
  quotes,
}: {
  quotes: StoredQuote[];
}) {
  const [filter, setFilter] = useState<Filter>("needs-action");
  // Local optimistic overlay — mirrors server state while the server
  // action is in flight. Keyed by ref.
  const [overlay, setOverlay] = useState<Record<string, Partial<StoredQuote>>>({});
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const effective = useMemo<StoredQuote[]>(() => {
    return quotes.map((q) => ({ ...q, ...(overlay[q.ref] ?? {}) }));
  }, [quotes, overlay]);

  const totals = useMemo(() => {
    return {
      all: effective.length,
      "needs-action": effective.filter((q) =>
        needsActionStates.includes(q.state),
      ).length,
      new: effective.filter((q) => q.state === "new").length,
      "under-review": effective.filter((q) => q.state === "under-review").length,
      "info-required": effective.filter((q) => q.state === "info-required").length,
      approved: effective.filter((q) => q.state === "approved").length,
      declined: effective.filter((q) => q.state === "declined").length,
      counteroffer: effective.filter((q) => q.state === "counteroffer").length,
      expired: effective.filter((q) => q.state === "expired").length,
    };
  }, [effective]);

  const rows = effective.filter((q) => matchesFilter(q.state, filter));
  const open = openRef ? effective.find((q) => q.ref === openRef) ?? null : null;

  useEffect(() => {
    if (!openRef) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenRef(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openRef]);

  // Reset the note field whenever the drawer opens a different quote.
  useEffect(() => {
    setNote("");
  }, [openRef]);

  const decide = (ref: string, decision: QuoteState) => {
    const trimmedNote = note.trim() || undefined;
    // Optimistic flip while the server action lands.
    setOverlay((prev) => ({
      ...prev,
      [ref]: {
        ...(prev[ref] ?? {}),
        state: decision,
        decisionNote: trimmedNote,
      },
    }));
    startTransition(async () => {
      const result = await decideQuoteAction(ref, decision, trimmedNote);
      if (result.ok) {
        setOverlay((prev) => ({
          ...prev,
          [ref]: {
            ...(prev[ref] ?? {}),
            state: result.state,
            decisionNote: trimmedNote,
            checkoutToken: result.checkoutToken,
            // Non-approved transitions clear the reservation.
            reservationExpiresISO:
              decision === "approved"
                ? prev[ref]?.reservationExpiresISO ??
                  new Date(Date.now() + 7 * 86_400_000).toISOString()
                : undefined,
          },
        }));
      } else {
        // Revert on failure.
        setOverlay((prev) => {
          const next = { ...prev };
          delete next[ref];
          return next;
        });
      }
    });
  };

  const previewDecisionEmail = (q: StoredQuote) => {
    const checkoutUrl = q.checkoutToken
      ? typeof window !== "undefined"
        ? `${window.location.origin}${wholesaleCheckoutPath(q.checkoutToken)}`
        : wholesaleCheckoutPath(q.checkoutToken)
      : undefined;
    const emailDecision: DecisionEmailProps["decision"] =
      q.state === "approved"
        ? "approved"
        : q.state === "declined"
        ? "declined"
        : q.state === "counteroffer"
        ? "counteroffer"
        : "info-required";
    const html =
      "<!doctype html>" +
      renderToStaticMarkup(
        <WholesaleDecisionEmail
          contactName={q.contactName}
          business={q.business}
          ref={q.ref}
          lines={q.lines.map((l) => ({ productName: l.productName, qty: l.qty }))}
          decision={emailDecision}
          note={q.decisionNote}
          checkoutUrl={checkoutUrl}
          reservationExpires={
            q.reservationExpiresISO
              ? new Date(q.reservationExpiresISO).toLocaleString(undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              : undefined
          }
        />,
      );
    const win = window.open("", "_blank", "width=840,height=1000");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const copyCheckoutLink = async (q: StoredQuote) => {
    if (!q.checkoutToken) return;
    const url = `${window.location.origin}${wholesaleCheckoutPath(q.checkoutToken)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // best-effort
    }
  };

  return (
    <>
      <Totals aria-label="Quote totals">
        <Tile>
          <TileK>Total quotes</TileK>
          <TileV>{totals.all}</TileV>
          <TileD>Sample data</TileD>
        </Tile>
        <Tile>
          <TileK>Needs action</TileK>
          <TileV $tone="warn">{totals["needs-action"]}</TileV>
          <TileD>New · Under review · More info</TileD>
        </Tile>
        <Tile>
          <TileK>Approved</TileK>
          <TileV $tone="ok">{totals.approved}</TileV>
          <TileD>Ready for the one-click wholesale checkout link</TileD>
        </Tile>
        <Tile>
          <TileK>Expired / Declined</TileK>
          <TileV $tone="muted">{totals.expired + totals.declined}</TileV>
          <TileD>Closed records</TileD>
        </Tile>
      </Totals>

      <Card>
        <Head>
          <h2>Quote queue</h2>
          <Filters role="group" aria-label="Filter quotes">
            <F $on={filter === "all"} onClick={() => setFilter("all")}>
              All · {totals.all}
            </F>
            <F
              $on={filter === "needs-action"}
              onClick={() => setFilter("needs-action")}
            >
              Needs action · {totals["needs-action"]}
            </F>
            <F $on={filter === "new"} onClick={() => setFilter("new")}>
              New · {totals.new}
            </F>
            <F
              $on={filter === "under-review"}
              onClick={() => setFilter("under-review")}
            >
              Under review · {totals["under-review"]}
            </F>
            <F
              $on={filter === "info-required"}
              onClick={() => setFilter("info-required")}
            >
              More info · {totals["info-required"]}
            </F>
            <F $on={filter === "approved"} onClick={() => setFilter("approved")}>
              Approved · {totals.approved}
            </F>
            <F
              $on={filter === "counteroffer"}
              onClick={() => setFilter("counteroffer")}
            >
              Counteroffer · {totals.counteroffer}
            </F>
            <F $on={filter === "declined"} onClick={() => setFilter("declined")}>
              Declined · {totals.declined}
            </F>
            <F $on={filter === "expired"} onClick={() => setFilter("expired")}>
              Expired · {totals.expired}
            </F>
          </Filters>
        </Head>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Submitted</th>
                <th>Business</th>
                <th style={{ textAlign: "right" }}>Units</th>
                <th>Requested tier</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => {
                const meta = QUOTE_STATE_META[q.state];
                return (
                  <tr
                    key={q.ref}
                    onClick={() => setOpenRef(q.ref)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenRef(q.ref);
                      }
                    }}
                  >
                    <td>
                      <RefMono>{q.ref}</RefMono>
                    </td>
                    <td>
                      <When>{formatRelative(q.submittedISO)}</When>
                    </td>
                    <td>
                      <BizCell>
                        <Biz>{q.business}</Biz>
                        <BizContact>{q.contactName}</BizContact>
                      </BizCell>
                    </td>
                    <Right>
                      <Mono>{totalUnits(q)}</Mono>
                    </Right>
                    <td>
                      <QuoteTier $review={q.requestedTier === "40"}>
                        {effectiveTier(q)}
                      </QuoteTier>
                    </td>
                    <td>
                      <Pill $tone={meta.tone}>
                        <PillDot aria-hidden="true" />
                        {meta.label}
                      </Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
        <Foot>
          <span>
            Showing {rows.length} of {totals.all}
          </span>
          <span>
            State changes stay local — connect the wholesale backend to
            persist decisions and send decision emails.
          </span>
        </Foot>
      </Card>

      <Scrim
        $open={openRef !== null}
        onClick={() => setOpenRef(null)}
        aria-hidden={openRef === null}
      />
      <Panel
        $open={openRef !== null}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        aria-hidden={openRef === null}
      >
        {open && (
          <>
            <PHead>
              <PTitle>
                <div className="ref" id="quote-title">
                  {open.ref}
                </div>
                <div className="biz">{open.business}</div>
              </PTitle>
              <Close
                type="button"
                onClick={() => setOpenRef(null)}
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
                <Pill $tone={QUOTE_STATE_META[open.state].tone}>
                  <PillDot aria-hidden="true" />
                  {QUOTE_STATE_META[open.state].label}
                </Pill>
              </StateRow>

              <Group>
                <GLabel>Contact</GLabel>
                <GVal>
                  {open.contactName}
                  {"\n"}
                  <a
                    href={`mailto:${open.email}`}
                    style={{ color: "#f0c040", textDecoration: "none" }}
                  >
                    {open.email}
                  </a>
                  {open.phone ? `\n${open.phone}` : ""}
                </GVal>
              </Group>

              <Group>
                <GLabel>
                  Line items · {totalUnits(open)} unit
                  {totalUnits(open) === 1 ? "" : "s"}
                </GLabel>
                <Lines>
                  {open.lines.map((l) => (
                    <Line key={l.productSlug}>
                      <span className="name">{l.productName}</span>
                      <span className="qty">×{l.qty}</span>
                    </Line>
                  ))}
                </Lines>
              </Group>

              <Group>
                <GLabel>Requested tier</GLabel>
                <GVal
                  style={{
                    color: open.requestedTier === "40" ? "#ff6b7a" : "#f0c040",
                    fontWeight: 700,
                  }}
                >
                  {effectiveTier(open)}
                </GVal>
              </Group>

              {open.neededBy && (
                <Group>
                  <GLabel>Needed by</GLabel>
                  <GVal>{open.neededBy}</GVal>
                </Group>
              )}

              {open.notes && (
                <Group>
                  <GLabel>Notes from buyer</GLabel>
                  <GVal>{open.notes}</GVal>
                </Group>
              )}

              {open.state === "approved" && open.checkoutToken && (
                <Group>
                  <GLabel>Wholesale checkout link</GLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "#1a1612",
                      border: "1px solid #4fb07d",
                      borderRadius: 8,
                    }}
                  >
                    <code
                      style={{
                        fontFamily:
                          "SFMono-Regular, Menlo, Consolas, monospace",
                        fontSize: "0.78rem",
                        color: "#4fb07d",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {wholesaleCheckoutPath(open.checkoutToken)}
                    </code>
                    <Btn
                      $tone="ok"
                      type="button"
                      onClick={() => copyCheckoutLink(open)}
                      style={{ padding: "6px 12px", fontSize: "0.72rem" }}
                    >
                      Copy link
                    </Btn>
                  </div>
                  {open.reservationExpiresISO && (
                    <GVal
                      style={{
                        fontSize: "0.78rem",
                        color: "#a89880",
                        marginTop: 6,
                      }}
                    >
                      Reservation expires{" "}
                      {new Date(open.reservationExpiresISO).toLocaleString(
                        undefined,
                        { dateStyle: "long", timeStyle: "short" },
                      )}
                    </GVal>
                  )}
                </Group>
              )}

              <Group>
                <GLabel htmlFor={`decision-note-${open.ref}`}>
                  Decision note (sent in the email)
                </GLabel>
                <textarea
                  id={`decision-note-${open.ref}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional context the buyer sees — the counter you're proposing, info you need, or why you declined."
                  rows={3}
                  style={{
                    background: "#1a1612",
                    border: "1.5px solid #2e2618",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#f5f0e8",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    resize: "vertical",
                    minHeight: 60,
                    lineHeight: 1.5,
                  }}
                />
              </Group>

              {open.decisionNote && (
                <Group>
                  <GLabel>Last decision note sent</GLabel>
                  <GVal
                    style={{
                      whiteSpace: "pre-line",
                      padding: "10px 12px",
                      background: "#1a1612",
                      borderRadius: 8,
                      borderLeft: "3px solid #4c7ce0",
                      fontSize: "0.88rem",
                    }}
                  >
                    {open.decisionNote}
                  </GVal>
                </Group>
              )}

              <Note>
                Decisions write to the file-backed quote store. Email
                delivery isn't wired — use <strong>Preview decision email</strong>{" "}
                to render the exact HTML and copy or forward it manually.
              </Note>
            </PBody>
            <Actions>
              <Btn
                type="button"
                onClick={() => previewDecisionEmail(open)}
                disabled={pending}
              >
                Preview decision email
              </Btn>
              {open.state !== "declined" && (
                <Btn
                  $tone="crim"
                  type="button"
                  disabled={pending}
                  onClick={() => decide(open.ref, "declined")}
                >
                  Decline
                </Btn>
              )}
              {open.state !== "info-required" && (
                <Btn
                  $tone="warn"
                  type="button"
                  disabled={pending}
                  onClick={() => decide(open.ref, "info-required")}
                >
                  Request info
                </Btn>
              )}
              {open.state !== "counteroffer" && (
                <Btn
                  $tone="warn"
                  type="button"
                  disabled={pending}
                  onClick={() => decide(open.ref, "counteroffer")}
                >
                  Counteroffer
                </Btn>
              )}
              {open.state === "new" && (
                <Btn
                  type="button"
                  disabled={pending}
                  onClick={() => decide(open.ref, "under-review")}
                >
                  Move to review
                </Btn>
              )}
              {open.state !== "approved" && (
                <Btn
                  $tone="ok"
                  type="button"
                  disabled={pending}
                  onClick={() => decide(open.ref, "approved")}
                >
                  Approve
                </Btn>
              )}
            </Actions>
          </>
        )}
      </Panel>
    </>
  );
}
