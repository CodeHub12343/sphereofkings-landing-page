"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import styled from "styled-components";
import type { EdiOrder, EdiOrderStatus } from "@/lib/edi/types";
import { EDI_STATUS_LABELS } from "@/lib/edi/types";
import {
  acknowledgeEdiOrderAction,
  shipEdiOrderAction,
  invoiceEdiOrderAction,
  closeEdiOrderAction,
  cancelEdiOrderAction,
} from "@/app/admin/edi/actions";

const Wrap = styled.div`
  padding: 32px 24px 80px;
  color: #f5f0e8;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: 1.6rem;
  margin: 0 0 4px;
  color: #f0c040;
`;

const Lede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
  margin: 0;
  max-width: 68ch;
`;

const Chip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(135deg, #c9a227, #f0c040);
  border-radius: 6px;
  text-decoration: none;
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const Stat = styled.div<{ $accent?: boolean }>`
  padding: 16px;
  background: ${(p) => (p.$accent ? "rgba(201,162,39,0.08)" : "#0e0c09")};
  border: 1px solid ${(p) => (p.$accent ? "#c9a227" : "#2e2618")};
  border-radius: 8px;
  .n {
    font-family: "Cinzel", serif;
    font-size: 1.6rem;
    color: ${(p) => (p.$accent ? "#f0c040" : "#f5f0e8")};
    font-weight: 700;
  }
  .l {
    font-family: "Inter", sans-serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a89880;
    margin-top: 4px;
  }
`;

const Section = styled.section`
  background: #0e0c09;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
  color: #f0c040;
  margin: 0 0 14px;
  letter-spacing: 0.04em;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  th {
    text-align: left;
    padding: 10px 12px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a89880;
    border-bottom: 1px solid #2e2618;
    font-weight: 700;
  }
  td {
    padding: 14px 12px;
    border-bottom: 1px solid #1a1510;
    color: #f5f0e8;
    vertical-align: top;
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

const Mono = styled.span`
  font-family: "Menlo", "Consolas", monospace;
  font-size: 0.78rem;
  color: #c9a227;
`;

const StatusPill = styled.span<{ $status: EdiOrderStatus }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${(p) => pillBg(p.$status)};
  color: ${(p) => pillFg(p.$status)};
  border: 1px solid ${(p) => pillBorder(p.$status)};
`;

function pillBg(s: EdiOrderStatus): string {
  switch (s) {
    case "received":
      return "rgba(201,162,39,0.14)";
    case "acknowledged":
      return "rgba(66,153,225,0.14)";
    case "in-fulfillment":
      return "rgba(237,137,54,0.14)";
    case "shipped":
      return "rgba(72,187,120,0.14)";
    case "invoiced":
      return "rgba(159,122,234,0.14)";
    case "closed":
      return "rgba(168,152,128,0.14)";
    case "rejected":
    case "cancelled":
      return "rgba(198,43,68,0.14)";
    default:
      return "rgba(168,152,128,0.14)";
  }
}
function pillFg(s: EdiOrderStatus): string {
  switch (s) {
    case "received":
      return "#f0c040";
    case "acknowledged":
      return "#63b3ed";
    case "in-fulfillment":
      return "#ed8936";
    case "shipped":
      return "#48bb78";
    case "invoiced":
      return "#b794f4";
    case "closed":
      return "#a89880";
    case "rejected":
    case "cancelled":
      return "#ff6b7a";
    default:
      return "#a89880";
  }
}
function pillBorder(s: EdiOrderStatus): string {
  switch (s) {
    case "received":
      return "rgba(240,192,64,0.4)";
    case "acknowledged":
      return "rgba(99,179,237,0.4)";
    case "in-fulfillment":
      return "rgba(237,137,54,0.4)";
    case "shipped":
      return "rgba(72,187,120,0.4)";
    case "invoiced":
      return "rgba(183,148,244,0.4)";
    case "closed":
      return "rgba(168,152,128,0.4)";
    case "rejected":
    case "cancelled":
      return "rgba(255,107,122,0.4)";
    default:
      return "rgba(168,152,128,0.4)";
  }
}

const ActionBtn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid
    ${(p) => (p.$danger ? "#c62b44" : p.$primary ? "#c9a227" : "#2e2618")};
  background: ${(p) =>
    p.$primary
      ? "linear-gradient(135deg, #c9a227, #f0c040)"
      : p.$danger
      ? "transparent"
      : "transparent"};
  color: ${(p) => (p.$primary ? "#0a0a0a" : p.$danger ? "#ff6b7a" : "#f5f0e8")};
  margin-right: 6px;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Toast = styled.div<{ $kind: "ok" | "err" }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 18px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  z-index: 50;
  background: ${(p) =>
    p.$kind === "ok" ? "rgba(72,187,120,0.14)" : "rgba(198,43,68,0.14)"};
  color: ${(p) => (p.$kind === "ok" ? "#48bb78" : "#ff6b7a")};
  border: 1px solid
    ${(p) => (p.$kind === "ok" ? "#48bb78" : "#c62b44")};
`;

const Empty = styled.div`
  padding: 40px;
  text-align: center;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
`;

const ProviderBadge = styled.span<{ $mock: boolean }>`
  display: inline-block;
  padding: 3px 10px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  border-radius: 4px;
  background: ${(p) =>
    p.$mock ? "rgba(198,43,68,0.14)" : "rgba(72,187,120,0.14)"};
  color: ${(p) => (p.$mock ? "#ff6b7a" : "#48bb78")};
  border: 1px solid ${(p) => (p.$mock ? "#c62b44" : "#48bb78")};
  margin-left: 10px;
  font-weight: 700;
`;

export default function EdiDashboard({
  orders,
  providerName,
  partnerCount,
}: {
  orders: EdiOrder[];
  providerName: string;
  partnerCount: number;
}) {
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );

  const stats = useMemo(() => {
    const counts: Record<EdiOrderStatus, number> = {
      received: 0,
      acknowledged: 0,
      "in-fulfillment": 0,
      shipped: 0,
      invoiced: 0,
      closed: 0,
      rejected: 0,
      cancelled: 0,
    };
    let valueCents = 0;
    for (const o of orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
      if (o.status !== "cancelled" && o.status !== "rejected") {
        valueCents += Math.round(o.subtotal * 100);
      }
    }
    return { counts, valueCents };
  }, [orders]);

  const fmtUSD = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const notify = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const run = (id: string, work: () => Promise<{ ok: boolean; error?: string } | unknown>, okMsg: string) => {
    setBusyId(id);
    start(async () => {
      try {
        const r = (await work()) as { ok: boolean; error?: string };
        if (r.ok) notify("ok", okMsg);
        else notify("err", r.error ?? "Action failed.");
      } catch (e) {
        notify("err", (e as Error).message);
      } finally {
        setBusyId(null);
      }
    });
  };

  const onAcknowledge = (id: string, po: string) =>
    run(id, () => acknowledgeEdiOrderAction(id), `Acknowledged ${po}`);
  const onShip = (id: string, po: string) => {
    const tracking = window.prompt("Tracking number?");
    if (!tracking) return;
    const carrier = window.prompt("Carrier? (DHL / UPS / FedEx / USPS)");
    if (!carrier) return;
    run(id, () => shipEdiOrderAction(id, { trackingNumber: tracking, carrier }), `Shipped ${po}`);
  };
  const onInvoice = (id: string, po: string) =>
    run(id, () => invoiceEdiOrderAction(id), `Invoiced ${po}`);
  const onClose = (id: string, po: string) =>
    run(id, () => closeEdiOrderAction(id), `Closed ${po}`);
  const onCancel = (id: string, po: string) => {
    if (!confirm(`Cancel PO ${po}? This cannot be undone.`)) return;
    const reason = window.prompt("Cancellation reason (optional)") ?? undefined;
    run(id, () => cancelEdiOrderAction(id, reason), `Cancelled ${po}`);
  };

  const isMock = providerName === "mock";

  return (
    <Wrap>
      <HeaderRow>
        <div>
          <Title>
            EDI Operations
            <ProviderBadge $mock={isMock}>
              {isMock ? `Mock provider` : providerName}
            </ProviderBadge>
          </Title>
          <Lede>
            Inbound retailer purchase orders (EDI 850), acknowledgments (855),
            advance shipping notices (856), and invoices (810). {isMock && (
              <>
                <strong style={{ color: "#f0c040" }}>
                  No live provider connected
                </strong>{" "}
                — set <Mono>EDI_PROVIDER</Mono> to <Mono>sps-commerce</Mono>,{" "}
                <Mono>orderful</Mono>, or <Mono>true-commerce</Mono> and fill
                the matching credentials in environment variables.
              </>
            )}
          </Lede>
        </div>
        <Chip href="/admin/edi/partners">
          Trading partners ({partnerCount}) →
        </Chip>
      </HeaderRow>

      <StatRow>
        <Stat $accent={stats.counts.received > 0}>
          <div className="n">{stats.counts.received}</div>
          <div className="l">New · needs ack</div>
        </Stat>
        <Stat>
          <div className="n">{stats.counts.acknowledged}</div>
          <div className="l">Acknowledged</div>
        </Stat>
        <Stat>
          <div className="n">{stats.counts["in-fulfillment"]}</div>
          <div className="l">In fulfillment</div>
        </Stat>
        <Stat>
          <div className="n">{stats.counts.shipped}</div>
          <div className="l">Shipped · ready to invoice</div>
        </Stat>
        <Stat>
          <div className="n">{stats.counts.invoiced}</div>
          <div className="l">Invoiced</div>
        </Stat>
        <Stat>
          <div className="n">{fmtUSD(stats.valueCents)}</div>
          <div className="l">Open order value</div>
        </Stat>
      </StatRow>

      <Section>
        <SectionTitle>Purchase orders</SectionTitle>
        {orders.length === 0 ? (
          <Empty>No EDI orders yet. Incoming POs will appear here once the provider sends them.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>PO #</th>
                <th>Retailer</th>
                <th>Received</th>
                <th>Lines</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ minWidth: 280 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Mono>{o.poNumber}</Mono>
                    {o.trackingNumber && (
                      <div style={{ fontSize: "0.72rem", color: "#a89880", marginTop: 4 }}>
                        {o.carrier} · {o.trackingNumber}
                      </div>
                    )}
                    {o.invoiceNumber && (
                      <div style={{ fontSize: "0.72rem", color: "#b794f4", marginTop: 2 }}>
                        {o.invoiceNumber}
                      </div>
                    )}
                  </td>
                  <td>{o.partnerName}</td>
                  <td style={{ color: "#a89880", fontSize: "0.78rem" }}>
                    {new Date(o.receivedISO).toLocaleDateString()}
                  </td>
                  <td>
                    {o.lines.length}
                    <div style={{ fontSize: "0.72rem", color: "#a89880", marginTop: 2 }}>
                      {o.lines.reduce((s, l) => s + l.quantity, 0)} units
                    </div>
                  </td>
                  <td>
                    ${o.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <StatusPill $status={o.status}>
                      {EDI_STATUS_LABELS[o.status]}
                    </StatusPill>
                  </td>
                  <td>
                    {o.status === "received" && (
                      <ActionBtn
                        $primary
                        disabled={pending && busyId === o.id}
                        onClick={() => onAcknowledge(o.id, o.poNumber)}
                      >
                        Acknowledge
                      </ActionBtn>
                    )}
                    {(o.status === "acknowledged" || o.status === "in-fulfillment") && (
                      <ActionBtn
                        $primary
                        disabled={pending && busyId === o.id}
                        onClick={() => onShip(o.id, o.poNumber)}
                      >
                        Send ASN
                      </ActionBtn>
                    )}
                    {o.status === "shipped" && (
                      <ActionBtn
                        $primary
                        disabled={pending && busyId === o.id}
                        onClick={() => onInvoice(o.id, o.poNumber)}
                      >
                        Invoice
                      </ActionBtn>
                    )}
                    {o.status === "invoiced" && (
                      <ActionBtn
                        disabled={pending && busyId === o.id}
                        onClick={() => onClose(o.id, o.poNumber)}
                      >
                        Close
                      </ActionBtn>
                    )}
                    {o.status !== "cancelled" && o.status !== "closed" && o.status !== "invoiced" && (
                      <ActionBtn
                        $danger
                        disabled={pending && busyId === o.id}
                        onClick={() => onCancel(o.id, o.poNumber)}
                      >
                        Cancel
                      </ActionBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {toast && <Toast $kind={toast.kind}>{toast.msg}</Toast>}
    </Wrap>
  );
}
