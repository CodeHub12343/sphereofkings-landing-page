"use client";

import { useState } from "react";
import styled from "styled-components";

export default function OrderForm({ designId }: { designId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true); setError(null); setOk(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      designId,
      shipping: {
        name: fd.get("name"),
        line1: fd.get("line1"),
        line2: fd.get("line2"),
        city: fd.get("city"),
        region: fd.get("region"),
        postalCode: fd.get("postalCode"),
        country: fd.get("country"),
      },
    };
    try {
      const r = await fetch("/api/custom-spheres", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Order failed."); return; }
      setOk(data.clientSecret
        ? "Order placed. Complete payment in Stripe Checkout (next release)."
        : "Order placed (dev-mode: Stripe not configured — order marked paid).");
    } finally { setBusy(false); }
  };

  if (ok) return <Ok>{ok}</Ok>;

  return (
    <Form onSubmit={submit}>
      <Field><label>Full name</label><input name="name" required maxLength={80} /></Field>
      <Field><label>Address line 1</label><input name="line1" required maxLength={120} /></Field>
      <Field><label>Address line 2</label><input name="line2" maxLength={120} /></Field>
      <Row>
        <Field><label>City</label><input name="city" required maxLength={60} /></Field>
        <Field><label>Region / State</label><input name="region" required maxLength={60} /></Field>
      </Row>
      <Row>
        <Field><label>Postal code</label><input name="postalCode" required maxLength={20} /></Field>
        <Field><label>Country (ISO alpha-2)</label><input name="country" required maxLength={2} minLength={2}
                     style={{ textTransform: "uppercase" }} placeholder="US / GB / NG" /></Field>
      </Row>
      {error && <Err>{error}</Err>}
      <Primary type="submit" disabled={busy}>{busy ? "Placing order…" : "Place order"}</Primary>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:10px;`;
const Row = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;`;
const Field = styled.div`
  display:flex;flex-direction:column;gap:4px;
  label{font-size:12px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;}
  input{background:var(--bg2,#0d0b08);color:var(--text,#f5f0e8);
    border:1px solid var(--border,#2a2218);border-radius:6px;padding:8px 10px;font-size:14px;}
`;
const Primary = styled.button`
  align-self:flex-start;background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:11px 16px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;}
`;
const Err = styled.div`color:var(--status-urgent,#ff6b7a);font-size:13px;`;
const Ok = styled.div`
  padding:14px;color:var(--text,#f5f0e8);
  background:rgba(79,176,125,.08);border:1px solid var(--status-online,#4fb07d);border-radius:8px;
`;
