"use client";

import { useState } from "react";
import styled from "styled-components";
import { FField, FLabel, FInput, FTextarea, FBtnGold, FBanner } from "@/components/feature/primitives";

export default function AmoeForm({ open }: { open: boolean }) {
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!open) {
      setState("err");
      setMsg("Entries are not open yet. Please check back once the official rules are posted.");
      return;
    }
    setBusy(true); setState("idle");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sweepstakes/amoe", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: fd.get("fullName"),
        email: fd.get("email"),
        mailingAddress: fd.get("mailingAddress"),
        state: fd.get("state"),
        age13Plus: fd.get("age13Plus") === "on",
        agreeRules: fd.get("agreeRules") === "on",
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setState("err"); setMsg(data.error ?? "Could not submit."); return; }
    setState("ok");
    setMsg(data.message ?? "Entry received.");
  };

  if (state === "ok") return <FBanner $tone="success">{msg}</FBanner>;

  return (
    <Form onSubmit={submit}>
      <FField><FLabel>Full name</FLabel><FInput name="fullName" required maxLength={80} /></FField>
      <FField><FLabel>Email</FLabel><FInput name="email" type="email" required /></FField>
      <FField><FLabel>Mailing address</FLabel><FTextarea name="mailingAddress" required rows={2} /></FField>
      <FField><FLabel>State (2-letter)</FLabel><FInput name="state" required maxLength={2} minLength={2}
             style={{ textTransform: "uppercase" }} placeholder="CA" /></FField>
      <CheckRow>
        <input type="checkbox" name="age13Plus" id="age13Plus" required />
        <label htmlFor="age13Plus">I am 13 years of age or older.</label>
      </CheckRow>
      <CheckRow>
        <input type="checkbox" name="agreeRules" id="agreeRules" required />
        <label htmlFor="agreeRules">I have read and agree to the official rules above.</label>
      </CheckRow>
      {state === "err" && <FBanner $tone="danger">{msg}</FBanner>}
      <FBtnGold type="submit" disabled={busy || !open} style={{ alignSelf: "flex-start", marginTop: 10 }}>
        {!open ? "Entries not open yet" : busy ? "Submitting…" : "Submit free entry"}
      </FBtnGold>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;max-width:520px;`;
const CheckRow = styled.div`
  display:flex;gap:10px;align-items:flex-start;margin:8px 0;
  input{margin-top:3px;accent-color:var(--gold,#c9a227);}
  label{color:var(--text,#f5f0e8);font-size:14px;}
`;
