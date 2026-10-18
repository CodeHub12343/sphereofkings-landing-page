"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { loadStripe, Stripe as StripeJs } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const Panel = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: "Inter", sans-serif;
`;

const Amount = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 800;
  font-size: 1.4rem;
  color: #f5f0e8;
`;

const Submit = styled.button`
  font-family: "Cinzel", serif;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 14px 24px;
  border-radius: 10px;
  border: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  transition: box-shadow 0.2s;

  &:hover:not(:disabled) {
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #ff6b7a;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
`;

const SuccessPanel = styled.div`
  background: rgba(79, 176, 125, 0.08);
  border: 1px solid #4fb07d;
  border-radius: 10px;
  padding: 14px;
  color: #4fb07d;
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;

  strong {
    color: #f5f0e8;
  }
`;

function formatUsd(minor: number): string {
  return `$${(minor / 100).toFixed(2)}`;
}

// The actual form inner — rendered inside <Elements> so useStripe /
// useElements have context.
function PayForm({
  amountMinor,
  returnUrl,
}: {
  amountMinor: number;
  returnUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setMessage(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    if (error) {
      setMessage(error.message ?? "Your bank declined this card.");
      setSubmitting(false);
    }
    // If no error, Stripe redirects to return_url. We never reach the
    // next line in the success case.
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />
      {message && <ErrorText role="alert">{message}</ErrorText>}
      <Row>
        <span style={{ color: "#a89880", fontSize: "0.82rem" }}>
          Charged in full on submit
        </span>
        <Amount>{formatUsd(amountMinor)}</Amount>
      </Row>
      <Submit type="submit" disabled={!stripe || !elements || submitting}>
        {submitting ? "Processing…" : `Pay ${formatUsd(amountMinor)}`}
      </Submit>
    </form>
  );
}

export type StripePaymentProps = {
  clientSecret: string;
  publishableKey: string;
  amountMinor: number;
  // Where Stripe redirects after a successful confirm. Keep the
  // orderRef in the URL so our confirmation page can read it.
  returnUrl: string;
};

// Loads Stripe.js once per publishable key, keeps the Elements provider
// mounted while the Pay step is visible.
export default function StripePayment({
  clientSecret,
  publishableKey,
  amountMinor,
  returnUrl,
}: StripePaymentProps) {
  const [stripePromise, setStripePromise] = useState<Promise<StripeJs | null> | null>(
    null,
  );

  useEffect(() => {
    setStripePromise(loadStripe(publishableKey));
  }, [publishableKey]);

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night" as const,
        labels: "floating" as const,
        variables: {
          colorPrimary: "#c9a227",
          colorBackground: "#1a1612",
          colorText: "#f5f0e8",
          colorTextSecondary: "#a89880",
          colorDanger: "#ff6b7a",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: "8px",
        },
      },
    }),
    [clientSecret],
  );

  if (!stripePromise) return <Panel>Loading payment form…</Panel>;

  return (
    <Panel>
      <Elements stripe={stripePromise} options={options}>
        <PayForm amountMinor={amountMinor} returnUrl={returnUrl} />
      </Elements>
    </Panel>
  );
}

export { SuccessPanel };
