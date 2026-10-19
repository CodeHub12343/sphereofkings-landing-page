"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { updateStatusAction } from "./actions";

export default function UpdateControls({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const act = async (status: string) => {
    await updateStatusAction({ id, status: status as "paid" });
    startTransition(() => router.refresh());
  };
  return (
    <Row>
      {currentStatus === "paid" && <Btn onClick={() => act("in-production")} disabled={pending}>Start production</Btn>}
      {currentStatus === "in-production" && <Btn onClick={() => act("shipped")} disabled={pending}>Mark shipped</Btn>}
      {currentStatus === "shipped" && <Btn onClick={() => act("delivered")} disabled={pending}>Mark delivered</Btn>}
      {currentStatus !== "cancelled" && currentStatus !== "delivered" &&
        <Danger onClick={() => act("cancelled")} disabled={pending}>Cancel</Danger>}
    </Row>
  );
}

const Row = styled.div`display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;`;
const Btn = styled.button`
  background:var(--bg3,#111009);color:var(--text,#f5f0e8);
  border:1px solid var(--border,#2a2218);border-radius:5px;padding:5px 9px;font-size:12px;cursor:pointer;
  &:hover{border-color:var(--gold,#c9a227);} &:disabled{opacity:.6;}
`;
const Danger = styled.button`
  background:transparent;color:var(--status-urgent,#ff6b7a);
  border:1px solid var(--status-urgent,#ff6b7a);border-radius:5px;padding:5px 9px;font-size:12px;cursor:pointer;
  &:disabled{opacity:.6;}
`;
