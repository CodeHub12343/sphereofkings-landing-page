"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { approveApplicationAction, rejectApplicationAction } from "./actions";

export default function LicenseReviewControls({ applicationId }: { applicationId: string }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const act = async (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setBusy(true); setMsg(null);
    const r = await fn();
    setMsg(r.error ?? "Done.");
    setBusy(false);
    startTransition(() => router.refresh());
  };

  return (
    <Panel>
      <input value={note} onChange={(e) => setNote(e.target.value)}
             placeholder="Review note (shared with applicant)"
             style={{ width: "100%", background: "var(--bg3,#111009)",
                     color: "var(--text,#f5f0e8)", border: "1px solid var(--border,#2a2218)",
                     borderRadius: 5, padding: "6px 8px", fontSize: 12 }} />
      <Row>
        <Approve onClick={() => act(() => approveApplicationAction({ applicationId, note }))} disabled={busy}>
          Approve → request $5,000 fee
        </Approve>
        <Reject onClick={() => act(() => rejectApplicationAction({ applicationId, note }))} disabled={busy}>
          Reject
        </Reject>
      </Row>
      {msg && <Note>{msg}</Note>}
    </Panel>
  );
}

const Panel = styled.div`display:flex;flex-direction:column;gap:6px;margin-top:12px;`;
const Row = styled.div`display:flex;gap:6px;flex-wrap:wrap;`;
const Approve = styled.button`
  font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  background:linear-gradient(135deg,#b8901e,#f0c040,#b8901e);color:#000;
  border:none;border-radius:5px;padding:8px 12px;cursor:pointer;
  &:disabled{opacity:.5;}
`;
const Reject = styled.button`
  font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  background:transparent;color:var(--status-urgent,#ff6b7a);
  border:1px solid var(--status-urgent,#ff6b7a);border-radius:5px;padding:8px 12px;cursor:pointer;
  &:disabled{opacity:.5;}
`;
const Note = styled.div`font-size:12px;color:var(--text-muted);`;
