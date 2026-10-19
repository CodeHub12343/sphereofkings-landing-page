"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { resolveReportAction } from "./actions";

export default function ResolveControls({ reportId }: { reportId: string }) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const act = async (resolution: "no-action" | "warning" | "suspension" | "ban") => {
    await resolveReportAction({ reportId, resolution, note });
    startTransition(() => router.refresh());
  };

  return (
    <Panel>
      <input value={note} onChange={(e) => setNote(e.target.value)}
             placeholder="Resolution note (optional)" />
      <Row>
        <Button onClick={() => act("no-action")} disabled={pending}>No action</Button>
        <Button onClick={() => act("warning")} disabled={pending}>Warn</Button>
        <Button onClick={() => act("suspension")} disabled={pending}>Suspend</Button>
        <Danger onClick={() => act("ban")} disabled={pending}>Ban</Danger>
      </Row>
    </Panel>
  );
}

const Panel = styled.div`
  display:flex;flex-direction:column;gap:6px;min-width:260px;
  input{background:var(--bg3,#111009);color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
    border-radius:5px;padding:6px 8px;font-size:12px;}
`;
const Row = styled.div`display:flex;gap:4px;flex-wrap:wrap;`;
const Button = styled.button`
  background:var(--bg3,#111009);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:5px;padding:5px 9px;font-size:12px;cursor:pointer;
  &:hover{border-color:var(--gold,#c9a227);} &:disabled{opacity:.6;}
`;
const Danger = styled.button`
  background:var(--status-urgent,#ff6b7a);color:#000;border:none;
  border-radius:5px;padding:5px 9px;font-size:12px;font-weight:700;cursor:pointer;
  &:disabled{opacity:.6;}
`;
