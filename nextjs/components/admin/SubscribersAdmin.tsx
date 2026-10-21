"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import { formatSubRelative, SubSource } from "@/lib/sample-subscribers";
import type { StoredSubscriber, SubscriberStatus } from "@/lib/store/subscribers-store";
import { resendConfirmationAction } from "@/app/subscribe/actions";
import {
  broadcastLaunchAnnouncementAction,
  sendLaunchToSubscriberAction,
} from "@/app/admin/subscribers/actions";

type Filter = "all" | "consented" | "pending" | "unsubscribed";
type Toast =
  | { kind: "idle" }
  | { kind: "copied"; email: string }
  | { kind: "sent"; label: string }
  | { kind: "pending-wire"; count: number }
  | {
      kind: "confirm-url";
      email: string;
      url: string;
    }
  | { kind: "error"; message: string };

// Keep local aliases so the rest of the component reads the same.
type ConsentState = SubscriberStatus;
type Row = StoredSubscriber;

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

const TileV = styled.div<{ $tone?: "warn" | "muted" }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 10px 0 2px;
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.$tone === "warn" ? "#e0a94a" : p.$tone === "muted" ? "#5a4a38" : "#f5f0e8"};
`;

const TileD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.span<{ $tone: "ok" | "warn" | "muted" }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) =>
    p.$tone === "ok" ? "#4fb07d" : p.$tone === "warn" ? "#e0a94a" : "#5a4a38"};
  display: inline-block;
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

const BulkBar = styled.div`
  padding: 10px 20px;
  background: rgba(201, 162, 39, 0.06);
  border-bottom: 1px solid #1e1a12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  span {
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    color: #f0c040;
    font-weight: 700;
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 8px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)"
      : "transparent"};
  color: ${(p) => (p.$primary ? "#0a0a0a" : "#f5f0e8")};
  border: ${(p) => (p.$primary ? "0" : "1px solid #2e2618")};
  padding: 7px 14px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    ${(p) =>
      p.$primary
        ? "box-shadow: 0 0 20px rgba(240, 192, 64, 0.25);"
        : "color: #f0c040; border-color: #c9a227;"}
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  min-width: 760px;

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
  thead th:first-child {
    width: 36px;
    padding-right: 0;
  }

  tbody td {
    padding: 12px 20px;
    border-top: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }
  tbody td:first-child {
    padding-right: 0;
  }

  tbody tr:hover td {
    background: #140f0a;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #c9a227;
  cursor: pointer;
`;

const EmailCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const EmailAddr = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  color: #f5f0e8;
`;

const EmailName = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const Pill = styled.span<{ $tone: "ok" | "warn" | "muted" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 9px;
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
    return "background: #1a1612; color: #5a4a38;";
  }}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const Source = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  background: #1a1612;
  padding: 2px 8px;
  border-radius: 3px;
`;

const LastSent = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const SendBtn = styled.button<{ $disabled?: boolean }>`
  background: transparent;
  border: 1px solid #2e2618;
  color: ${(p) => (p.$disabled ? "#5a4a38" : "#f5f0e8")};
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const FootBar = styled.footer`
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

const ToastWrap = styled.div<{ $on: boolean }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 300;
  transform: translateY(${(p) => (p.$on ? "0" : "20px")});
  opacity: ${(p) => (p.$on ? 1 : 0)};
  pointer-events: ${(p) => (p.$on ? "auto" : "none")};
  transition: transform 0.2s ease, opacity 0.2s ease;
`;

const ToastBody = styled.div`
  background: #0e0c09;
  border: 1px solid #e0a94a;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  svg {
    color: #e0a94a;
    flex-shrink: 0;
    margin-top: 2px;
  }
  h3 {
    font-family: "Cinzel", serif;
    color: #e0a94a;
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 4px;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.82rem;
    line-height: 1.5;
    margin: 0;
  }
  strong {
    color: #f5f0e8;
  }
  button.close {
    background: transparent;
    border: 0;
    color: #a89880;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
    align-self: flex-start;

    &:hover {
      color: #f0c040;
    }
  }
`;

function matchesFilter(c: SubscriberStatus, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "consented") return c === "consented";
  if (f === "pending") return c === "pending-confirm";
  if (f === "unsubscribed") return c === "unsubscribed";
  return true;
}

function consentPill(c: SubscriberStatus) {
  switch (c) {
    case "consented":
      return (
        <Pill $tone="ok">
          <PillDot aria-hidden="true" />
          Consented
        </Pill>
      );
    case "pending-confirm":
      return (
        <Pill $tone="warn">
          <PillDot aria-hidden="true" />
          Pending confirm
        </Pill>
      );
    case "unsubscribed":
      return <Pill $tone="muted">Unsubscribed</Pill>;
  }
}

function sourceLabel(s: SubSource | string): string {
  if (s === "landing") return "Landing";
  if (s === "contact") return "Contact";
  if (s === "donate") return "Donate";
  return "Import";
}

export default function SubscribersAdmin({
  subscribers,
}: {
  subscribers: StoredSubscriber[];
}) {
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast>({ kind: "idle" });

  const totals = useMemo(() => {
    return {
      all: subscribers.length,
      consented: subscribers.filter((s) => s.status === "consented").length,
      pending: subscribers.filter((s) => s.status === "pending-confirm").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    };
  }, [subscribers]);

  const rows: Row[] = subscribers.filter((s) =>
    matchesFilter(s.status, filter),
  );
  const rowKeys = rows.map((r) => r.email);
  const allSelected = rowKeys.length > 0 && rowKeys.every((k) => selected.has(k));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      for (const k of rowKeys) next.delete(k);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const r of rows) {
        if (r.status === "pending-confirm" || r.status === "consented") {
          next.add(r.email);
        }
      }
      setSelected(next);
    }
  };

  const toggleOne = (s: Row) => {
    const next = new Set(selected);
    if (next.has(s.email)) next.delete(s.email);
    else next.add(s.email);
    setSelected(next);
  };

  const sendOne = (s: Row) => {
    // Pending-confirm rows: surface the confirmation URL for the
    // operator to share. Consented rows: actually resend the launch
    // email via Resend. Unsubscribed: nothing to do.
    if (s.status === "pending-confirm") {
      startTransition(async () => {
        const result = await resendConfirmationAction(s.email);
        if (result.ok) {
          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}${result.confirmPath}`
              : result.confirmPath;
          setToast({ kind: "confirm-url", email: s.email, url });
        } else {
          setToast({ kind: "error", message: result.error });
        }
      });
      return;
    }
    if (s.status === "consented") {
      startTransition(async () => {
        const result = await sendLaunchToSubscriberAction(s.email);
        if (result.ok) {
          setToast({ kind: "sent", label: `Sent to ${result.email}` });
        } else {
          setToast({ kind: "error", message: result.error });
        }
      });
      return;
    }
    setToast({ kind: "error", message: `Cannot send to ${s.status} rows.` });
  };

  const sendBulk = () => {
    const emails = Array.from(selected);
    if (emails.length === 0) return;
    startTransition(async () => {
      let sent = 0;
      let failed = 0;
      for (const email of emails) {
        const r = await sendLaunchToSubscriberAction(email);
        if (r.ok) sent++;
        else failed++;
      }
      setSelected(new Set());
      if (failed === 0) {
        setToast({ kind: "sent", label: `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}` });
      } else {
        setToast({
          kind: "error",
          message: `Sent ${sent}, failed ${failed}. Check Audit for details.`,
        });
      }
    });
  };

  // Broadcast the LaunchAnnouncement to EVERY consented subscriber.
  // Guard rail: the admin must type the current consented count to
  // confirm; the server rejects anything that doesn't match. This
  // keeps a stray click from emailing the whole list.
  const broadcastLaunch = () => {
    if (totals.consented === 0) {
      setToast({
        kind: "error",
        message: "No consented subscribers to send to.",
      });
      return;
    }
    const typed = window.prompt(
      `Send the launch email to ALL ${totals.consented} consented subscribers?\n\nType the number ${totals.consented} to confirm.`,
      "",
    );
    const n = Number.parseInt(typed ?? "", 10);
    if (!Number.isFinite(n)) return;
    startTransition(async () => {
      const result = await broadcastLaunchAnnouncementAction(n).catch(
        () => ({ ok: false, error: "Network error" } as const),
      );
      if (result.ok) {
        setToast({
          kind: "error",
          message: `Launch sent — ${result.sent}/${result.total} delivered${
            result.failed > 0 ? ` (${result.failed} failed, check /admin/audit)` : ""
          }.`,
        });
      } else {
        setToast({ kind: "error", message: result.error });
      }
    });
  };

  const copyToast = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ kind: "copied", email: "" });
      setTimeout(() => setToast({ kind: "idle" }), 1500);
    } catch {
      // best-effort
    }
  };

  return (
    <>
      <Totals aria-label="Subscriber totals">
        <Tile>
          <TileK>Total subscribers</TileK>
          <TileV>{totals.all}</TileV>
          <TileD>
            <Dot $tone="ok" aria-hidden="true" />
            Sample data
          </TileD>
        </Tile>
        <Tile>
          <TileK>Consented</TileK>
          <TileV>{totals.consented}</TileV>
          <TileD>Eligible to receive the launch email</TileD>
        </Tile>
        <Tile>
          <TileK>Pending confirm</TileK>
          <TileV $tone="warn">{totals.pending}</TileV>
          <TileD>Double opt-in not yet completed</TileD>
        </Tile>
        <Tile>
          <TileK>Unsubscribed</TileK>
          <TileV $tone="muted">{totals.unsubscribed}</TileV>
          <TileD>Excluded from all sends</TileD>
        </Tile>
      </Totals>

      <Card>
        <Head>
          <h2>Launch list</h2>
          <Filters role="group" aria-label="Filter subscribers">
            <F $on={filter === "all"} onClick={() => setFilter("all")}>
              All · {totals.all}
            </F>
            <F $on={filter === "consented"} onClick={() => setFilter("consented")}>
              Consented · {totals.consented}
            </F>
            <F $on={filter === "pending"} onClick={() => setFilter("pending")}>
              Pending · {totals.pending}
            </F>
            <F $on={filter === "unsubscribed"} onClick={() => setFilter("unsubscribed")}>
              Unsubscribed · {totals.unsubscribed}
            </F>
            <Btn
              $primary
              type="button"
              onClick={broadcastLaunch}
              disabled={totals.consented === 0}
              style={{ marginLeft: "auto" }}
              title={
                totals.consented === 0
                  ? "No consented subscribers to send to"
                  : `Broadcast launch to ${totals.consented} consented subscribers`
              }
            >
              Broadcast launch · {totals.consented}
            </Btn>
          </Filters>
        </Head>

        {selected.size > 0 && (
          <BulkBar>
            <span>
              {selected.size} selected · consented only
            </span>
            <BulkActions>
              <Btn type="button" onClick={() => setSelected(new Set())}>
                Clear
              </Btn>
              <Btn $primary type="button" onClick={sendBulk}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6l8-4-3 9-1-4-4-1Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                Resend launch email
              </Btn>
            </BulkActions>
          </BulkBar>
        )}

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>
                  <Checkbox
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible consented subscribers"
                  />
                </th>
                <th>Email</th>
                <th>Signed up</th>
                <th>Consent</th>
                <th>Source</th>
                <th>Last email</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const canSend =
                  s.status === "consented" || s.status === "pending-confirm";
                const checked = selected.has(s.email);
                return (
                  <tr key={s.email}>
                    <td>
                      <Checkbox
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(s)}
                        disabled={!canSend}
                        aria-label={`Select ${s.email}`}
                      />
                    </td>
                    <td>
                      <EmailCell>
                        <EmailAddr>{s.email}</EmailAddr>
                        {s.firstName && <EmailName>{s.firstName}</EmailName>}
                      </EmailCell>
                    </td>
                    <td style={{ color: "#a89880", fontSize: "0.78rem" }}>
                      {formatSubRelative(s.signedUpISO)}
                    </td>
                    <td>{consentPill(s.status)}</td>
                    <td>
                      <Source>{sourceLabel(s.source)}</Source>
                    </td>
                    <td>
                      <LastSent>
                        {s.lastEmailSentISO
                          ? formatSubRelative(s.lastEmailSentISO)
                          : "—"}
                      </LastSent>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <SendBtn
                        type="button"
                        onClick={() => canSend && sendOne(s)}
                        disabled={!canSend}
                        $disabled={!canSend}
                        title={
                          s.status === "pending-confirm"
                            ? "Show the one-time confirmation URL"
                            : s.status === "consented"
                            ? "Resend the launch email (email provider pending)"
                            : "Unsubscribed addresses are never shown an action"
                        }
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path
                            d="M2 6l8-4-3 9-1-4-4-1Z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {s.status === "pending-confirm" ? "Confirm link" : "Resend"}
                      </SendBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
        <FootBar>
          <span>
            Showing {rows.length} of {totals.all}
          </span>
          <span>
            Resend wired — the Resend and Broadcast buttons send real email to the subscriber.
          </span>
        </FootBar>
      </Card>

      <ToastWrap $on={toast.kind !== "idle"} aria-live="polite">
        {toast.kind === "pending-wire" && (
          <ToastBody>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M9 5v4m0 2v.3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <h3>Email provider not wired</h3>
              <p>
                We captured intent for{" "}
                <strong>
                  {toast.count} subscriber{toast.count === 1 ? "" : "s"}
                </strong>
                . No email was sent — connect Resend or Postmark and an
                approved sender to turn this into real sends. The
                subscribers remain on the Consented list.
              </p>
            </div>
            <button
              className="close"
              type="button"
              aria-label="Dismiss"
              onClick={() => setToast({ kind: "idle" })}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </ToastBody>
        )}
        {toast.kind === "confirm-url" && (
          <ToastBody style={{ borderColor: "#4fb07d" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#4fb07d" }}>
              <path
                d="M3 9l4 4 8-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h3 style={{ color: "#4fb07d" }}>Confirmation link ready</h3>
              <p>
                Share this URL with <strong>{toast.email}</strong>:
              </p>
              <code
                style={{
                  display: "block",
                  marginTop: 8,
                  fontFamily:
                    "SFMono-Regular, Menlo, Consolas, monospace",
                  fontSize: "0.78rem",
                  color: "#f0c040",
                  background: "#0a0a0a",
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #2e2618",
                  wordBreak: "break-all",
                }}
              >
                {toast.url}
              </code>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => copyToast(toast.url)}
                  style={{
                    background: "transparent",
                    border: "1px solid #2e2618",
                    color: "#f5f0e8",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Copy link
                </button>
                <a
                  href={`mailto:${toast.email}?subject=${encodeURIComponent(
                    "Confirm your Sphere of Kings subscription",
                  )}&body=${encodeURIComponent(
                    `Confirm your subscription with this link: ${toast.url}`,
                  )}`}
                  style={{
                    background: "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)",
                    color: "#0a0a0a",
                    textDecoration: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Compose email
                </a>
              </div>
            </div>
            <button
              className="close"
              type="button"
              aria-label="Dismiss"
              onClick={() => setToast({ kind: "idle" })}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </ToastBody>
        )}
        {toast.kind === "copied" && (
          <ToastBody style={{ borderColor: "#4fb07d" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#4fb07d" }}>
              <path
                d="M3 9l4 4 8-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h3 style={{ color: "#4fb07d" }}>Copied</h3>
            </div>
          </ToastBody>
        )}
        {toast.kind === "sent" && (
          <ToastBody style={{ borderColor: "#4fb07d" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#4fb07d" }}>
              <path
                d="M3 9l4 4 8-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h3 style={{ color: "#4fb07d" }}>{toast.label}</h3>
            </div>
            <button
              className="close"
              aria-label="Dismiss"
              onClick={() => setToast({ kind: "idle" })}
            >
              ×
            </button>
          </ToastBody>
        )}
        {toast.kind === "error" && (
          <ToastBody style={{ borderColor: "#c62b44" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "#ff6b7a" }}>
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M9 5v4m0 2v.3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <h3 style={{ color: "#ff6b7a" }}>Couldn't send</h3>
              <p>{toast.message}</p>
            </div>
            <button
              className="close"
              type="button"
              aria-label="Dismiss"
              onClick={() => setToast({ kind: "idle" })}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </ToastBody>
        )}
      </ToastWrap>
    </>
  );
}
