"use client";

import { useState, useTransition } from "react";
import styled from "styled-components";
import {
  approveWithdrawalAction,
  rejectWithdrawalAction,
  completeWithdrawalAction,
} from "@/app/admin/affiliates/requests/actions";

type Props = {
  id: string;
  status: "pending" | "approved" | "completed" | "rejected";
  amountDisplay: string;
};

type Mode = "idle" | "approve" | "reject" | "complete";

export default function WithdrawalRequestActions({ id, status, amountDisplay }: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const terminal = status === "completed" || status === "rejected";

  if (terminal) {
    return (
      <Panel>
        <Dim>
          This request is {status}. No further actions available — the orders have{" "}
          {status === "completed" ? "flipped to paid-out" : "been released back to the available balance"}.
        </Dim>
      </Panel>
    );
  }

  const doApprove = () =>
    startTransition(async () => {
      setFeedback(null);
      const r = await approveWithdrawalAction(id, note);
      setFeedback(r.ok ? { ok: true, message: r.message } : { ok: false, message: r.error });
      if (r.ok) {
        setMode("idle");
        setNote("");
      }
    });

  const doReject = () =>
    startTransition(async () => {
      setFeedback(null);
      const r = await rejectWithdrawalAction(id, reason);
      setFeedback(r.ok ? { ok: true, message: r.message } : { ok: false, message: r.error });
      if (r.ok) {
        setMode("idle");
        setReason("");
      }
    });

  const doComplete = () =>
    startTransition(async () => {
      setFeedback(null);
      const r = await completeWithdrawalAction(id, reference, note);
      setFeedback(r.ok ? { ok: true, message: r.message } : { ok: false, message: r.error });
      if (r.ok) {
        setMode("idle");
        setReference("");
        setNote("");
      }
    });

  return (
    <Panel>
      <PanelTitle>Actions</PanelTitle>

      {feedback && (
        <Feedback $ok={feedback.ok}>{feedback.message}</Feedback>
      )}

      {mode === "idle" && (
        <Row>
          {status === "pending" && (
            <>
              <Btn $kind="primary" onClick={() => setMode("approve")}>Approve request</Btn>
              <Btn $kind="success" onClick={() => setMode("complete")}>Mark completed · paid</Btn>
              <Btn $kind="danger" onClick={() => setMode("reject")}>Reject</Btn>
            </>
          )}
          {status === "approved" && (
            <>
              <Btn $kind="success" onClick={() => setMode("complete")}>Mark completed · paid</Btn>
              <Btn $kind="danger" onClick={() => setMode("reject")}>Reject</Btn>
            </>
          )}
        </Row>
      )}

      {mode === "approve" && (
        <Form>
          <Label>Optional note (visible to the affiliate)</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder='e.g. "Will transfer tomorrow morning."' />
          <Row>
            <Btn $kind="primary" onClick={doApprove} disabled={pending}>
              {pending ? "Approving…" : `Approve ${amountDisplay}`}
            </Btn>
            <Btn $kind="muted" onClick={() => setMode("idle")}>Cancel</Btn>
          </Row>
        </Form>
      )}

      {mode === "reject" && (
        <Form>
          <Label>Reason (shown to the affiliate · required)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Payout details look invalid — please re-check and request again." />
          <Row>
            <Btn $kind="danger" onClick={doReject} disabled={pending || reason.trim().length < 4}>
              {pending ? "Rejecting…" : "Reject request"}
            </Btn>
            <Btn $kind="muted" onClick={() => setMode("idle")}>Cancel</Btn>
          </Row>
        </Form>
      )}

      {mode === "complete" && (
        <Form>
          <Label>Payment reference / transfer ID (required)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. bank ref FT24102200893 / PayPal txn id" />
          <Label style={{ marginTop: 8 }}>Note (optional)</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder='e.g. "Sent via Chase 2026-10-22."' />
          <Row>
            <Btn $kind="success" onClick={doComplete} disabled={pending || reference.trim().length < 2}>
              {pending ? "Finalising…" : `Confirm paid ${amountDisplay}`}
            </Btn>
            <Btn $kind="muted" onClick={() => setMode("idle")}>Cancel</Btn>
          </Row>
          <Hint>
            This flips every order in the request to paid-out and emails the affiliate a payout statement.
            Only click after the bank/PayPal transfer has actually gone out.
          </Hint>
        </Form>
      )}
    </Panel>
  );
}

const Panel = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 18px;
  margin-top: 20px;
`;

const PanelTitle = styled.h2`
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  color: #a89880;
  text-transform: uppercase;
  font-weight: 700;
  margin: 0 0 14px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
  font-weight: 600;
`;

const Input = styled.input`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 8px;
  padding: 11px 14px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  &:focus { outline: 0; border-color: #c9a227; }
`;

const Hint = styled.p`
  margin: 0;
  color: #5a4a38;
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  line-height: 1.5;
`;

const Btn = styled.button<{ $kind: "primary" | "success" | "danger" | "muted" }>`
  border: 1px solid transparent;
  padding: 10px 16px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  ${(p) =>
    p.$kind === "primary"
      ? `background: #c9a227; color: #0a0a0a;`
      : p.$kind === "success"
        ? `background: #4fb07d; color: #0a0a0a;`
        : p.$kind === "danger"
          ? `background: transparent; color: #ff6b7a; border-color: #c62b44;`
          : `background: transparent; color: #a89880; border-color: #2e2618;`}
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Feedback = styled.p<{ $ok: boolean }>`
  padding: 10px 12px;
  border-radius: 8px;
  margin: 0 0 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  line-height: 1.45;
  background: ${(p) => (p.$ok ? "rgba(79,176,125,0.08)" : "rgba(185,28,28,0.08)")};
  border: 1px solid ${(p) => (p.$ok ? "#4fb07d" : "#c62b44")};
  color: ${(p) => (p.$ok ? "#4fb07d" : "#ff6b7a")};
`;
