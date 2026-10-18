"use client";

import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import type { AuditEvent } from "@/lib/db/collections/audit";

type Filter = "all" | "wholesale" | "product" | "finance";

function category(event: AuditEvent): Filter {
  if (event.action.startsWith("quote.")) return "wholesale";
  if (event.action.startsWith("product.")) return "product";
  if (event.action.startsWith("finance.")) return "finance";
  return "all";
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actorLabel(a: AuditEvent["actor"]): string {
  if (a.kind === "env-basic") {
    return `${a.email ?? "basic"} (env)`;
  }
  if (a.kind === "system") return "system";
  return a.email ?? a.id ?? "admin";
}

function actorInitials(a: AuditEvent["actor"]): string {
  if (a.email) {
    const [name] = a.email.split("@");
    return name.slice(0, 2).toUpperCase();
  }
  if (a.kind === "system") return "SY";
  return "AD";
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    "quote.decide": "Wholesale decision",
    "product.create": "Product created",
    "product.update": "Product edited",
    "product.delete": "Product deleted",
    "finance.closeMonth": "Month closed",
    "finance.reopenMonth": "Month re-opened",
  };
  return map[action] ?? action;
}

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

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
    padding: 12px 20px;
    border-top: 1px solid #1e1a12;
    vertical-align: top;
    color: #f5f0e8;
  }
  tbody tr {
    cursor: pointer;
  }
  tbody tr:hover td {
    background: #140f0a;
  }
`;

const When = styled.span`
  color: #a89880;
  font-size: 0.78rem;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
`;

const ActorCell = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Ava = styled.div<{ $kind: AuditEvent["actor"]["kind"] }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: "Cinzel", serif;
  font-weight: 800;
  font-size: 0.7rem;
  flex-shrink: 0;
  color: ${(p) => (p.$kind === "admin-session" ? "#0a0a0a" : "#f5f0e8")};
  background: ${(p) =>
    p.$kind === "admin-session"
      ? "linear-gradient(135deg, #b8901e, #f0c040 50%, #b8901e)"
      : p.$kind === "env-basic"
      ? "#2a2010"
      : "#1a1612"};
  border: 1px solid
    ${(p) =>
      p.$kind === "admin-session"
        ? "#c9a227"
        : p.$kind === "env-basic"
        ? "#e0a94a"
        : "#2e2618"};
`;

const ActorName = styled.div`
  font-family: "Inter", sans-serif;
  color: #f5f0e8;
  font-weight: 600;
  font-size: 0.88rem;
`;

const ActorRole = styled.div`
  font-family: "Inter", sans-serif;
  color: #a89880;
  font-size: 0.72rem;
`;

const ActionPill = styled.span<{ $cat: Filter }>`
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
    if (p.$cat === "wholesale")
      return "background: rgba(201,162,39,0.14); color: #f0c040;";
    if (p.$cat === "product")
      return "background: rgba(76,124,224,0.14); color: #7fa3ff;";
    if (p.$cat === "finance")
      return "background: rgba(79,176,125,0.14); color: #4fb07d;";
    return "background: #1a1612; color: #a89880;";
  }}
`;

const Target = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  color: #a89880;
  font-size: 0.78rem;
`;

const Foot = styled.footer`
  padding: 12px 20px;
  border-top: 1px solid #1e1a12;
  background: #0a0a0a;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const Empty = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.55;

  strong {
    display: block;
    color: #f5f0e8;
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
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
  width: min(540px, 100vw);
  background: #0a0a0a;
  border-left: 1px solid #1a1510;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
  z-index: 201;
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const PHead = styled.header`
  padding: 20px 22px;
  border-bottom: 1px solid #1a1510;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const PBody = styled.div`
  padding: 20px 22px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
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
  line-height: 1.5;
`;

const Pre = styled.pre`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.78rem;
  color: #f5f0e8;
  background: #1a1612;
  padding: 12px;
  border-radius: 8px;
  margin: 0;
  overflow-x: auto;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

export default function AuditView({ events }: { events: AuditEvent[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      all: events.length,
      wholesale: events.filter((e) => category(e) === "wholesale").length,
      product: events.filter((e) => category(e) === "product").length,
      finance: events.filter((e) => category(e) === "finance").length,
    };
  }, [events]);

  const rows = events.filter((e) => filter === "all" || category(e) === filter);
  const open = openId ? events.find((e) => e.id === openId) ?? null : null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openId]);

  return (
    <>
      <Totals aria-label="Audit totals">
        <Tile>
          <TileK>Total events</TileK>
          <TileV>{counts.all}</TileV>
          <TileD>Across every admin surface</TileD>
        </Tile>
        <Tile>
          <TileK>Wholesale</TileK>
          <TileV>{counts.wholesale}</TileV>
          <TileD>Quote decisions</TileD>
        </Tile>
        <Tile>
          <TileK>Products</TileK>
          <TileV>{counts.product}</TileV>
          <TileD>Create · update · delete</TileD>
        </Tile>
        <Tile>
          <TileK>Finance</TileK>
          <TileV>{counts.finance}</TileV>
          <TileD>Close / re-open</TileD>
        </Tile>
      </Totals>

      <Card>
        <Head>
          <h2>Audit log</h2>
          <Filters role="group" aria-label="Filter audit events">
            <F $on={filter === "all"} onClick={() => setFilter("all")}>
              All · {counts.all}
            </F>
            <F
              $on={filter === "wholesale"}
              onClick={() => setFilter("wholesale")}
            >
              Wholesale · {counts.wholesale}
            </F>
            <F $on={filter === "product"} onClick={() => setFilter("product")}>
              Products · {counts.product}
            </F>
            <F $on={filter === "finance"} onClick={() => setFilter("finance")}>
              Finance · {counts.finance}
            </F>
          </Filters>
        </Head>
        {rows.length === 0 ? (
          <Empty>
            <strong>No events yet.</strong>
            Admin edits start appearing here the moment someone decides a
            quote, closes a month, or edits a product.
          </Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const cat = category(e);
                return (
                  <tr
                    key={e.id}
                    onClick={() => setOpenId(e.id)}
                    tabIndex={0}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        setOpenId(e.id);
                      }
                    }}
                  >
                    <td>
                      <When>{formatTimestamp(e.timestampISO)}</When>
                    </td>
                    <td>
                      <ActorCell>
                        <Ava $kind={e.actor.kind} aria-hidden="true">
                          {actorInitials(e.actor)}
                        </Ava>
                        <div>
                          <ActorName>{actorLabel(e.actor)}</ActorName>
                          {e.actor.role && (
                            <ActorRole>{e.actor.role}</ActorRole>
                          )}
                        </div>
                      </ActorCell>
                    </td>
                    <td>
                      <ActionPill $cat={cat}>{actionLabel(e.action)}</ActionPill>
                    </td>
                    <td>
                      <Target>
                        {e.target.collection}/{e.target.id}
                      </Target>
                    </td>
                    <td>{e.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <Foot>
          <span>
            Showing {rows.length} of {counts.all}
          </span>
          <span>
            Append-only · never edited or deleted after write
          </span>
        </Foot>
      </Card>

      <Scrim
        $open={!!open}
        onClick={() => setOpenId(null)}
        aria-hidden={!open}
      />
      <Panel
        $open={!!open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-title"
        aria-hidden={!open}
      >
        {open && (
          <>
            <PHead>
              <div>
                <GLabel style={{ marginBottom: 4 }}>Event</GLabel>
                <div
                  id="audit-title"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "1.1rem",
                    color: "#f5f0e8",
                    fontWeight: 800,
                  }}
                >
                  {actionLabel(open.action)}
                </div>
                <div
                  style={{
                    fontFamily:
                      "SFMono-Regular, Menlo, Consolas, monospace",
                    color: "#a89880",
                    fontSize: "0.72rem",
                    marginTop: 4,
                  }}
                >
                  {open.id}
                </div>
              </div>
              <Close
                type="button"
                aria-label="Close"
                onClick={() => setOpenId(null)}
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
              <Group>
                <GLabel>When</GLabel>
                <GVal>{formatTimestamp(open.timestampISO)}</GVal>
              </Group>
              <Group>
                <GLabel>Actor</GLabel>
                <GVal>
                  {actorLabel(open.actor)}
                  {open.actor.role ? ` · ${open.actor.role}` : ""}{" "}
                  <span style={{ color: "#5a4a38", fontSize: "0.78rem" }}>
                    ({open.actor.kind})
                  </span>
                </GVal>
              </Group>
              <Group>
                <GLabel>Target</GLabel>
                <GVal>
                  <code
                    style={{
                      fontFamily:
                        "SFMono-Regular, Menlo, Consolas, monospace",
                      color: "#f0c040",
                      background: "#1a1612",
                      padding: "2px 7px",
                      borderRadius: 3,
                      fontSize: "0.82rem",
                    }}
                  >
                    {open.target.collection}/{open.target.id}
                  </code>
                </GVal>
              </Group>
              <Group>
                <GLabel>Summary</GLabel>
                <GVal>{open.summary}</GVal>
              </Group>
              {open.details && Object.keys(open.details).length > 0 && (
                <Group>
                  <GLabel>Details</GLabel>
                  <Pre>{JSON.stringify(open.details, null, 2)}</Pre>
                </Group>
              )}
            </PBody>
          </>
        )}
      </Panel>
    </>
  );
}
