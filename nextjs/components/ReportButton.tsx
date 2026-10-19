"use client";

import { useState } from "react";
import styled from "styled-components";
import type { ReportSubject } from "@/lib/db/collections/safety";

interface Props { subjectKind: ReportSubject; subjectId: string; label?: string; }

export default function ReportButton({ subjectKind, subjectId, label = "Report" }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<"harassment" | "spam" | "cheating" | "age" | "other">("harassment");
  const [state, setState] = useState<"idle" | "sent" | "err">("idle");
  const [err, setErr] = useState<string>("");

  const submit = async () => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectKind, subjectId, reason, category }),
    });
    const data = await res.json();
    if (!res.ok) { setState("err"); setErr(data.error ?? "Report failed."); return; }
    setState("sent"); setTimeout(() => setOpen(false), 1000);
  };

  if (!open) return <Btn onClick={() => setOpen(true)}>{label}</Btn>;
  return (
    <Panel>
      <Row>
        <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
          <option value="harassment">Harassment</option>
          <option value="spam">Spam</option>
          <option value="cheating">Cheating</option>
          <option value="age">Underage</option>
          <option value="other">Other</option>
        </select>
      </Row>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                rows={3} maxLength={500} placeholder="What happened?" />
      {state === "err" && <Err>{err}</Err>}
      {state === "sent" && <Ok>Reported. Thanks.</Ok>}
      <Row>
        <Primary onClick={submit} disabled={state === "sent" || reason.trim().length < 3}>Send report</Primary>
        <Secondary onClick={() => setOpen(false)}>Cancel</Secondary>
      </Row>
    </Panel>
  );
}

const Btn = styled.button`
  background:transparent;color:var(--text-muted,#a89880);border:1px solid var(--border,#2a2218);
  border-radius:5px;padding:5px 10px;font-size:12px;cursor:pointer;
  &:hover{color:var(--status-urgent,#ff6b7a);border-color:var(--status-urgent,#ff6b7a);}
`;
const Panel = styled.div`
  display:flex;flex-direction:column;gap:8px;padding:12px;
  background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:8px;max-width:360px;
  textarea,select{
    background:var(--bg3,#111009);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:5px;padding:6px 8px;font-size:13px;font-family:inherit;
  }
`;
const Row = styled.div`display:flex;gap:8px;align-items:center;flex-wrap:wrap;`;
const Primary = styled.button`
  background:var(--status-urgent,#ff6b7a);color:#000;border:none;border-radius:5px;
  padding:7px 10px;font-size:12px;font-weight:600;cursor:pointer;
  &:disabled{opacity:.6;cursor:not-allowed;}
`;
const Secondary = styled.button`
  background:transparent;color:var(--text-muted,#a89880);border:1px solid var(--border,#2a2218);
  border-radius:5px;padding:7px 10px;font-size:12px;cursor:pointer;
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:12px;`;
const Ok = styled.div`color:var(--status-online,#4fb07d);font-size:12px;`;
