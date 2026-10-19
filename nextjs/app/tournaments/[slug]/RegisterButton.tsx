"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

export default function RegisterButton({
  slug, alreadyRegistered, status,
}: { slug: string; alreadyRegistered: boolean; status: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const open = status === "registration";

  const register = async () => {
    const res = await fetch(`/api/tournaments/${slug}/register`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setState("err"); setMsg(data.error ?? "Could not register."); return; }
    setState("ok"); setMsg("You're in.");
    startTransition(() => router.refresh());
  };
  const withdraw = async () => {
    if (!confirm("Withdraw from this tournament?")) return;
    const res = await fetch(`/api/tournaments/${slug}/register`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setState("err"); setMsg(data.error ?? "Could not withdraw.");
      return;
    }
    startTransition(() => router.refresh());
  };

  if (alreadyRegistered) {
    return (
      <Row>
        <Chip>Registered</Chip>
        {open && <Secondary onClick={withdraw} disabled={pending}>Withdraw</Secondary>}
      </Row>
    );
  }
  return (
    <Row>
      <Primary onClick={register} disabled={!open || pending}>
        {open ? "Register" : "Registration not open yet"}
      </Primary>
      {state === "err" && <Err>{msg}</Err>}
      {state === "ok" && <Ok>{msg}</Ok>}
    </Row>
  );
}

const Row = styled.div`display:flex;gap:10px;align-items:center;flex-wrap:wrap;`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:9px 14px;font-size:14px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;cursor:not-allowed;}
`;
const Secondary = styled.button`
  background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);border:1px solid var(--border,#2a2218);
  border-radius:6px;padding:9px 14px;font-size:14px;cursor:pointer;
  &:hover{border-color:var(--status-urgent,#ff6b7a);color:var(--status-urgent,#ff6b7a);}
`;
const Chip = styled.span`
  padding:5px 10px;border-radius:4px;background:rgba(79,176,125,.1);
  color:var(--status-online,#4fb07d);font-size:13px;border:1px solid var(--status-online,#4fb07d);
`;
const Err = styled.span`color:var(--status-urgent,#ff6b7a);font-size:13px;`;
const Ok = styled.span`color:var(--status-online,#4fb07d);font-size:13px;`;
