"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Wrap } from "@/components/shared";
import type { PayoutMethodKind } from "@/lib/sample-affiliates";
import {
  savePayoutMethodAction,
  SavePayoutMethodState,
} from "@/app/affiliate/payout/actions";

const INITIAL: SavePayoutMethodState = {};

const METHODS: { value: PayoutMethodKind; label: string; help: string; placeholder: string }[] = [
  {
    value: "bank",
    label: "Bank transfer",
    help: "Send the full IBAN or account + routing/sort code. We'll wire payouts there.",
    placeholder: "e.g. GB29 NWBK 6016 1331 9268 19 — account name: Your Name",
  },
  {
    value: "wise",
    label: "Wise",
    help: "The email registered on your Wise account.",
    placeholder: "you@example.com",
  },
  {
    value: "paypal",
    label: "PayPal",
    help: "The email on your PayPal account.",
    placeholder: "you@example.com",
  },
];

type Props = {
  currentMethod: PayoutMethodKind | null;
  currentDetails: string;
  updatedISO: string | null;
};

export default function PayoutMethodForm({
  currentMethod,
  currentDetails,
  updatedISO,
}: Props) {
  const [state, formAction, pending] = useActionState(savePayoutMethodAction, INITIAL);
  const [method, setMethod] = useState<PayoutMethodKind>(currentMethod ?? "bank");

  const effectiveSaved =
    state && "ok" in state && state.ok === true
      ? new Date(state.savedISO).toLocaleString()
      : updatedISO
        ? new Date(updatedISO).toLocaleString()
        : null;

  const spec = METHODS.find((m) => m.value === method)!;

  return (
    <Section>
      <Wrap>
        <TopRow>
          <BackLink href="/affiliate">← Back to dashboard</BackLink>
          {effectiveSaved && <Saved>Last saved {effectiveSaved}</Saved>}
        </TopRow>
        <Card action={formAction}>
          <Title>Payout method</Title>
          <Sub>
            How you want to be paid when a withdrawal request is approved.
            This is only visible to you and the Sphere of Kings admins —
            never on your public profile.
          </Sub>

          {state && "ok" in state && state.ok === false && (
            <ErrorBox role="alert">{state.error}</ErrorBox>
          )}
          {state && "ok" in state && state.ok === true && (
            <OkBox role="status">Saved. Admins will use this on your next payout.</OkBox>
          )}

          <Group role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => (
              <Choice key={m.value} $on={method === m.value}>
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                />
                <ChoiceBody>
                  <ChoiceLabel>{m.label}</ChoiceLabel>
                  <ChoiceHelp>{m.help}</ChoiceHelp>
                </ChoiceBody>
              </Choice>
            ))}
          </Group>

          <Row>
            <Label htmlFor="details">
              {method === "bank"
                ? "Bank account details"
                : method === "wise"
                  ? "Wise handle / email"
                  : "PayPal email"}
            </Label>
            <Textarea
              id="details"
              name="details"
              rows={method === "bank" ? 4 : 2}
              placeholder={spec.placeholder}
              defaultValue={currentDetails}
              required
              minLength={4}
              maxLength={400}
            />
            <Hint>
              Plain text. If your bank needs extra fields (BIC/SWIFT, intermediary bank),
              add them on their own lines.
            </Hint>
          </Row>

          <Submit type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save payout method"}
          </Submit>
        </Card>
      </Wrap>
    </Section>
  );
}

const Section = styled.section`
  background: #0a0a0a;
  min-height: 100vh;
  padding: clamp(32px, 5vw, 56px) 0 clamp(48px, 7vw, 96px);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

const BackLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
  text-decoration: none;
  &:hover { color: #f0c040; }
`;

const Saved = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #5a4a38;
`;

const Card = styled.form`
  max-width: 640px;
  margin: 0 auto;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
  margin: 0;
  line-height: 1.55;
`;

const ErrorBox = styled.p`
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid #c62b44;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #ff6b7a;
  line-height: 1.45;
`;

const OkBox = styled.p`
  background: rgba(79, 176, 125, 0.08);
  border: 1px solid #4fb07d;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #4fb07d;
  line-height: 1.45;
`;

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Choice = styled.label<{ $on: boolean }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${(p) => (p.$on ? "rgba(201, 162, 39, 0.08)" : "#1a1612")};
  border: 1.5px solid ${(p) => (p.$on ? "#c9a227" : "#2e2618")};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  input { margin-top: 3px; accent-color: #f0c040; }
`;

const ChoiceBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const ChoiceLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #f5f0e8;
`;

const ChoiceHelp = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.75rem;
  color: #a89880;
  line-height: 1.45;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #a89880;
`;

const Textarea = styled.textarea`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 8px;
  padding: 11px 14px;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  resize: vertical;
  min-height: 60px;
  &:focus { outline: 0; border-color: #c9a227; box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12); }
`;

const Hint = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #5a4a38;
  line-height: 1.5;
`;

const Submit = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 13px 20px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  &:hover:not(:disabled) { box-shadow: 0 0 24px rgba(240, 192, 64, 0.3); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
