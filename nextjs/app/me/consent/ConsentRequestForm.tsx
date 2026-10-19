"use client";

import { useState } from "react";
import styled from "styled-components";

export default function ConsentRequestForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "err">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/consent/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ parentEmail: email }),
    });
    const data = await r.json();
    if (!r.ok) { setState("err"); setErr(data.error ?? "Could not send."); return; }
    setState("sent");
  };

  if (state === "sent") {
    return (
      <Ok>
        Email sent. Ask your parent to check their inbox (and spam folder).
        The link is valid for 7 days.
      </Ok>
    );
  }

  return (
    <Form onSubmit={submit}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
             placeholder="parent@example.com" />
      {state === "err" && <Err>{err}</Err>}
      <Primary type="submit">Send consent email</Primary>
    </Form>
  );
}

const Form = styled.form`
  display:flex;flex-direction:column;gap:10px;margin-top:16px;
  input{
    background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:6px;padding:10px 12px;font-size:15px;
  }
`;
const Primary = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:11px 14px;font-size:15px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);}
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:13px;`;
const Ok = styled.div`
  margin-top:16px;padding:14px;background:rgba(79,176,125,.08);
  border:1px solid var(--status-online,#4fb07d);border-radius:8px;color:var(--text,#f5f0e8);
`;
