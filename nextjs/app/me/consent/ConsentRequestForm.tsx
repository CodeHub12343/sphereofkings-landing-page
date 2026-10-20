"use client";

import { useState } from "react";
import styled from "styled-components";
import { FField, FLabel, FInput, FBtnGold, FBanner } from "@/components/feature/primitives";

export default function ConsentRequestForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "err">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/consent/request", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ parentEmail: email }),
    });
    const data = await r.json();
    if (!r.ok) { setState("err"); setErr(data.error ?? "Could not send."); return; }
    setState("sent");
  };

  if (state === "sent") {
    return (
      <FBanner $tone="success">
        Email sent. Ask your parent to check their inbox (and spam folder). The link is valid for 7 days.
      </FBanner>
    );
  }

  return (
    <Form onSubmit={submit}>
      <FField>
        <FLabel>Parent / guardian email</FLabel>
        <FInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com" />
      </FField>
      {state === "err" && <FBanner $tone="danger">{err}</FBanner>}
      <FBtnGold type="submit" style={{ alignSelf: "flex-start", marginTop: 10 }}>Send consent email</FBtnGold>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;`;
