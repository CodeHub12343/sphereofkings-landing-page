"use client";

import { useState } from "react";
import styled from "styled-components";
import {
  FField, FLabel, FInput, FBtnGold, FBanner,
} from "@/components/feature/primitives";

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
        name: fd.get("name"), line1: fd.get("line1"), line2: fd.get("line2"),
        city: fd.get("city"), region: fd.get("region"),
        postalCode: fd.get("postalCode"), country: fd.get("country"),
      },
    };
    try {
      const r = await fetch("/api/custom-spheres", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Order failed."); return; }
      setOk(data.clientSecret
        ? "Order placed. Complete payment in Stripe Checkout (next release)."
        : "Order placed (dev-mode: Stripe not configured — order marked paid).");
    } finally { setBusy(false); }
  };

  if (ok) return <FBanner $tone="success">{ok}</FBanner>;

  return (
    <Form onSubmit={submit}>
      <FField><FLabel>Full name</FLabel><FInput name="name" required maxLength={80} /></FField>
      <FField><FLabel>Address line 1</FLabel><FInput name="line1" required maxLength={120} /></FField>
      <FField><FLabel>Address line 2</FLabel><FInput name="line2" maxLength={120} /></FField>
      <Row>
        <FField><FLabel>City</FLabel><FInput name="city" required maxLength={60} /></FField>
        <FField><FLabel>Region / State</FLabel><FInput name="region" required maxLength={60} /></FField>
      </Row>
      <Row>
        <FField><FLabel>Postal code</FLabel><FInput name="postalCode" required maxLength={20} /></FField>
        <FField><FLabel>Country (ISO alpha-2)</FLabel>
          <FInput name="country" required maxLength={2} minLength={2}
                  style={{ textTransform: "uppercase" }} placeholder="US / GB / NG" /></FField>
      </Row>
      {error && <FBanner $tone="danger">{error}</FBanner>}
      <FBtnGold type="submit" disabled={busy} style={{ alignSelf: "flex-start", marginTop: 10 }}>
        {busy ? "Placing order…" : "Place order"}
      </FBtnGold>
    </Form>
  );
}

const Form = styled.form`display:flex;flex-direction:column;gap:4px;`;
const Row = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;`;
