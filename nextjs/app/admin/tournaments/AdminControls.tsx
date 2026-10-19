"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { cancelTournamentAction, forceStartAction } from "./actions";

export default function AdminControls({ slug, status }: { slug: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const start = async () => {
    if (!confirm("Force start this tournament now?")) return;
    const r = await forceStartAction(slug);
    if (r.error) alert(r.error);
    startTransition(() => router.refresh());
  };
  const cancel = async () => {
    if (!confirm("Cancel this tournament?")) return;
    await cancelTournamentAction(slug);
    startTransition(() => router.refresh());
  };

  return (
    <Row>
      {(status === "upcoming" || status === "registration") && (
        <Button onClick={start} disabled={pending}>Force start</Button>
      )}
      {status !== "finished" && status !== "cancelled" && (
        <Danger onClick={cancel} disabled={pending}>Cancel</Danger>
      )}
    </Row>
  );
}

const Row = styled.div`display:flex;gap:6px;`;
const Button = styled.button`
  background:var(--bg3,#111009);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:5px;padding:5px 10px;font-size:12px;cursor:pointer;
  &:hover{border-color:var(--gold,#c9a227);} &:disabled{opacity:.6;}
`;
const Danger = styled.button`
  background:var(--bg3,#111009);color:var(--status-urgent,#ff6b7a);
  border:1px solid var(--status-urgent,#ff6b7a);border-radius:5px;padding:5px 10px;font-size:12px;cursor:pointer;
  &:hover{background:rgba(255,107,122,.08);} &:disabled{opacity:.6;}
`;
