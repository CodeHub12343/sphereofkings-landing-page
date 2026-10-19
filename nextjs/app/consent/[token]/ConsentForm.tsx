"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

// Client-side Stripe Elements loader. Falls back to a hosted-fields
// placeholder when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is unset so
// local dev still renders.

export default function ConsentForm({ token }: { token: string }) {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) { setError("Payments not configured."); return; }
    void (async () => {
      try {
        const mod = await import("@stripe/stripe-js");
        const s = await mod.loadStripe(pk);
        if (!s) { setError("Could not load Stripe."); return; }
        setStripe(s);
        const el = s.elements({ appearance: { theme: "night" } });
        setElements(el);
        const c = el.create("card", {
          style: { base: { color: "#f5f0e8", fontFamily: "inherit", fontSize: "15px" } },
        });
        c.mount("#consent-card");
        setCard(c);
        setReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Stripe load error");
      }
    })();
  }, []);

  const submit = async () => {
    if (!stripe || !card) return;
    setBusy(true); setError(null);
    const pm = await stripe.createPaymentMethod({ type: "card", card });
    if (pm.error) {
      setError(pm.error.message ?? "Could not read the card.");
      setBusy(false);
      return;
    }
    const res = await fetch("/api/consent/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, paymentMethodId: pm.paymentMethod.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Consent failed.");
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
  };

  if (done) {
    return (
      <Ok>Thank you. Consent granted and the $0.50 charge has been refunded.
      Your child can now use their Sphere of Kings account.</Ok>
    );
  }

  return (
    <Wrap>
      <Label>Card details</Label>
      <CardBox id="consent-card" />
      {error && <Err>{error}</Err>}
      <Submit onClick={submit} disabled={!ready || busy}>
        {busy ? "Processing…" : "Approve consent · $0.50 (refunded)"}
      </Submit>
    </Wrap>
  );
}

const Wrap = styled.div`display:flex;flex-direction:column;gap:10px;`;
const Label = styled.div`font-size:12px;color:var(--text-muted,#a89880);text-transform:uppercase;letter-spacing:.05em;`;
const CardBox = styled.div`
  padding:14px;background:var(--bg2,#0d0b08);border:1px solid var(--border,#2a2218);border-radius:8px;
`;
const Err = styled.div`
  padding:8px 10px;color:var(--status-urgent,#ff6b7a);background:rgba(255,107,122,.08);
  border:1px solid var(--status-urgent,#ff6b7a);border-radius:6px;font-size:13px;
`;
const Ok = styled.div`
  padding:14px;color:var(--status-online,#4fb07d);background:rgba(79,176,125,.08);
  border:1px solid var(--status-online,#4fb07d);border-radius:8px;font-size:14px;
`;
const Submit = styled.button`
  background:var(--gold,#c9a227);color:#000;border:none;border-radius:6px;
  padding:12px 14px;font-size:15px;font-weight:600;cursor:pointer;
  &:hover{background:var(--gold-light,#f0c040);} &:disabled{opacity:.6;cursor:not-allowed;}
`;
