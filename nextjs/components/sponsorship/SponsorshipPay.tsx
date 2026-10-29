"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import StripePayment from "@/components/checkout/StripePayment";
import { createSponsorshipPaymentIntentAction } from "@/app/sponsorship/actions";

const Panel = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 22px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
`;

const ErrorPanel = styled(Panel)`
  border-color: rgba(255, 107, 122, 0.4);
  background: rgba(255, 107, 122, 0.08);
  color: #ff6b7a;
`;

const SuccessPanel = styled(Panel)`
  border-color: rgba(79, 176, 125, 0.4);
  background: rgba(79, 176, 125, 0.06);
`;

type Props = {
  sponsorshipRef: string;
  tierName: string;
  priceDisplay: string;
  businessName: string;
  state: string;
};

type IntentState =
  | { kind: "loading" }
  | {
      kind: "ready";
      clientSecret: string;
      publishableKey: string;
      amountMinor: number;
    }
  | { kind: "paid" }
  | { kind: "error"; message: string };

export default function SponsorshipPay({
  sponsorshipRef: ref,
  tierName,
  priceDisplay,
  businessName,
  state,
}: Props) {
  const [s, setS] = useState<IntentState>({ kind: "loading" });

  useEffect(() => {
    if (state === "paid") {
      setS({ kind: "paid" });
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await createSponsorshipPaymentIntentAction(ref);
      if (cancelled) return;
      if (res.ok) {
        setS({
          kind: "ready",
          clientSecret: res.clientSecret,
          publishableKey: res.publishableKey,
          amountMinor: res.amountMinor,
        });
      } else if (res.reason === "already-paid") {
        setS({ kind: "paid" });
      } else if (res.reason === "stripe-not-wired") {
        setS({
          kind: "error",
          message:
            "Payments aren't wired up yet. James will reach out personally to complete your sponsorship.",
        });
      } else if (res.reason === "not-found") {
        setS({ kind: "error", message: "Reservation not found." });
      } else {
        setS({
          kind: "error",
          message:
            "message" in res
              ? res.message
              : "Could not initialize payment. Please try again.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ref, state]);

  if (s.kind === "loading") {
    return <Panel>Preparing secure payment…</Panel>;
  }
  if (s.kind === "error") {
    return (
      <ErrorPanel role="alert">
        <strong>Payment unavailable.</strong>
        <div style={{ marginTop: 6 }}>{s.message}</div>
        <div style={{ marginTop: 10, color: "#a89880", fontSize: "0.85rem" }}>
          You can reach James directly at Jbowser727@gmail.com or 209-622-9391
          — reference <strong>{ref}</strong>.
        </div>
      </ErrorPanel>
    );
  }
  if (s.kind === "paid") {
    return (
      <SuccessPanel>
        <h2
          style={{
            margin: "0 0 8px",
            fontFamily: "'Cinzel', serif",
            color: "#4fb07d",
            fontSize: "1.1rem",
          }}
        >
          Already paid.
        </h2>
        <p style={{ margin: 0, color: "#d9cfbe" }}>
          Your {tierName} ({priceDisplay}) for {businessName} is confirmed. We
          sent a receipt to the email on file.
        </p>
      </SuccessPanel>
    );
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const returnUrl = `${origin}/sponsorship/thanks/${encodeURIComponent(ref)}`;

  return (
    <StripePayment
      clientSecret={s.clientSecret}
      publishableKey={s.publishableKey}
      amountMinor={s.amountMinor}
      returnUrl={returnUrl}
    />
  );
}
