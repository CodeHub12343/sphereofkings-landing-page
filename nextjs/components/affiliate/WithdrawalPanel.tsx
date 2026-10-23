"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import styled from "styled-components";
import { requestWithdrawalAction } from "@/app/affiliate/actions";
import type { WithdrawalRequestView } from "./AffiliateAuthedShell";

type Props = {
  availableMinor: number;
  lockedMinor: number;
  paidOutMinor: number;
  payoutConfigured: boolean;
  requests: WithdrawalRequestView[];
};

const fmt = (minor: number) => `$${(minor / 100).toFixed(2)}`;

export default function WithdrawalPanel({
  availableMinor,
  lockedMinor,
  paidOutMinor,
  payoutConfigured,
  requests,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const open = requests.find((r) => r.status === "pending" || r.status === "approved");
  const historical = requests.filter((r) => r !== open);

  const disabled =
    pending || !payoutConfigured || availableMinor <= 0 || Boolean(open);

  const onRequest = () => {
    setFeedback(null);
    startTransition(async () => {
      const r = await requestWithdrawalAction();
      if (r.ok) {
        setFeedback({ ok: true, message: `Request opened for ${fmt(r.amountMinor)}. We'll notify you when the admin reviews it.` });
      } else {
        setFeedback({ ok: false, message: r.error });
      }
    });
  };

  return (
    <Card>
      <Head>
        <h2>Earnings</h2>
        <Link href="/affiliate/payout" style={{ color: "#a89880", fontSize: "0.82rem", textDecoration: "none" }}>
          {payoutConfigured ? "Payout settings →" : "Set payout method →"}
        </Link>
      </Head>

      <Tiles>
        <Tile>
          <TileK>Available to withdraw</TileK>
          <TileV>{fmt(availableMinor)}</TileV>
          <TileHint>Eligible commissions not tied to a request</TileHint>
        </Tile>
        <Tile>
          <TileK>In an open request</TileK>
          <TileV>{fmt(lockedMinor)}</TileV>
          <TileHint>Locked while admin reviews / pays</TileHint>
        </Tile>
        <Tile>
          <TileK>Paid lifetime</TileK>
          <TileV>{fmt(paidOutMinor)}</TileV>
          <TileHint>All completed payouts</TileHint>
        </Tile>
      </Tiles>

      {!payoutConfigured && (
        <Warn>
          Add a payout method before you can request a withdrawal.{" "}
          <Link href="/affiliate/payout" style={{ color: "#f0c040" }}>Set it up →</Link>
        </Warn>
      )}

      {feedback && <Feedback $ok={feedback.ok}>{feedback.message}</Feedback>}

      {open ? (
        <OpenRequestBanner>
          <strong>Open request · {fmt(open.amountMinor)}</strong>
          <span>
            Status: <StatusChip status={open.status} />{" "}
            {open.decisionISO
              ? ` since ${new Date(open.decisionISO).toLocaleDateString()}`
              : ` opened ${new Date(open.requestedISO).toLocaleDateString()}`}
          </span>
          <span style={{ color: "#5a4a38", fontSize: "0.78rem" }}>
            You can open the next one once this clears.
          </span>
        </OpenRequestBanner>
      ) : (
        <RequestBtn type="button" onClick={onRequest} disabled={disabled}>
          {pending
            ? "Opening request…"
            : availableMinor <= 0
              ? "No eligible balance to withdraw"
              : `Request withdrawal · ${fmt(availableMinor)}`}
        </RequestBtn>
      )}

      {historical.length > 0 && (
        <>
          <HistoryHead>Request history</HistoryHead>
          <HistoryTable>
            {historical.slice(0, 10).map((r) => (
              <HistoryRow key={r.id}>
                <StatusChip status={r.status} />
                <span style={{ color: "#f5f0e8" }}>{fmt(r.amountMinor)}</span>
                <span style={{ color: "#a89880", fontSize: "0.8rem" }}>
                  {r.payoutMethod === "bank" ? "Bank" : r.payoutMethod === "wise" ? "Wise" : "PayPal"}
                </span>
                <span style={{ color: "#5a4a38", fontSize: "0.78rem", textAlign: "right" }}>
                  {r.completedISO
                    ? `Paid ${new Date(r.completedISO).toLocaleDateString()}`
                    : r.decisionISO
                      ? `Decided ${new Date(r.decisionISO).toLocaleDateString()}`
                      : `Opened ${new Date(r.requestedISO).toLocaleDateString()}`}
                </span>
                {r.rejectReason && (
                  <RejectReason>Reason: {r.rejectReason}</RejectReason>
                )}
              </HistoryRow>
            ))}
          </HistoryTable>
        </>
      )}
    </Card>
  );
}

function StatusChip({ status }: { status: WithdrawalRequestView["status"] }) {
  const color =
    status === "pending" ? "#f0c040"
      : status === "approved" ? "#4ea9ff"
        : status === "completed" ? "#4fb07d"
          : "#ff6b7a";
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 999, background: `${color}22`, color,
      fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      {status}
    </span>
  );
}

const Card = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const Head = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-weight: 800;
    font-size: 1.15rem;
    margin: 0;
  }
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Tile = styled.div`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 12px 14px;
`;

const TileK = styled.div`
  font-family: "Inter", sans-serif;
  color: #a89880;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
`;

const TileV = styled.div`
  font-family: "Inter", sans-serif;
  color: #f5f0e8;
  font-size: 1.4rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
`;

const TileHint = styled.div`
  font-family: "Inter", sans-serif;
  color: #5a4a38;
  font-size: 0.72rem;
  margin-top: 2px;
`;

const Warn = styled.p`
  background: rgba(240, 192, 64, 0.06);
  border: 1px solid #c9a227;
  border-radius: 8px;
  padding: 10px 12px;
  color: #f0c040;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  margin: 0 0 12px;
`;

const Feedback = styled.p<{ $ok: boolean }>`
  padding: 10px 12px;
  border-radius: 8px;
  margin: 0 0 12px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  background: ${(p) => (p.$ok ? "rgba(79,176,125,0.08)" : "rgba(185,28,28,0.08)")};
  border: 1px solid ${(p) => (p.$ok ? "#4fb07d" : "#c62b44")};
  color: ${(p) => (p.$ok ? "#4fb07d" : "#ff6b7a")};
`;

const OpenRequestBanner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(78, 169, 255, 0.08);
  border: 1px solid #4ea9ff;
  border-radius: 10px;
  padding: 12px 14px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
`;

const RequestBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 13px 20px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover:not(:disabled) { box-shadow: 0 0 24px rgba(240, 192, 64, 0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const HistoryHead = styled.h3`
  font-family: "Inter", sans-serif;
  color: #a89880;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  margin: 20px 0 10px;
`;

const HistoryTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HistoryRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr 70px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
`;

const RejectReason = styled.span`
  grid-column: 1 / -1;
  padding-top: 6px;
  border-top: 1px dashed #2e2618;
  margin-top: 4px;
  color: #ff6b7a;
  font-size: 0.78rem;
`;
