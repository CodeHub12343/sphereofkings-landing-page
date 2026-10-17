"use client";

import { useState } from "react";
import styled from "styled-components";

const PRESETS = [
  { amount: 10, label: "Supporter" },
  { amount: 25, label: "Patron" },
  { amount: 50, label: "Royal" },
  { amount: 100, label: "Imperial" },
];

const MIN = 1;
const MAX = 1000;

type Status = "idle" | "submitting" | "pending-config" | "success";

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  overflow: hidden;
`;

const Ornament = styled.div`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 124, 224, 0.14) 0%, transparent 65%);
  pointer-events: none;
`;

const Eye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7fa3ff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;

  &::before {
    content: "";
    width: 24px;
    height: 1px;
    background: #4c7ce0;
  }
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.15;
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
  position: relative;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span<{ $tone: "muted" | "warn" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;

  ${(p) =>
    p.$tone === "muted" &&
    `background: #1a1612; border: 1px solid #2e2618; color: #a89880;`}
  ${(p) =>
    p.$tone === "warn" &&
    `background: rgba(224, 169, 74, 0.12); border: 1px solid #e0a94a; color: #e0a94a;`}
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Tile = styled.button<{ $on: boolean }>`
  background: ${(p) => (p.$on ? "rgba(76, 124, 224, 0.12)" : "#1a1612")};
  border: 1.5px solid ${(p) => (p.$on ? "#4c7ce0" : "#2e2618")};
  border-radius: 10px;
  padding: 16px 8px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  color: ${(p) => (p.$on ? "#7fa3ff" : "#f5f0e8")};

  &:hover {
    border-color: #4c7ce0;
  }
  &:focus-visible {
    outline: 2px solid #4c7ce0;
    outline-offset: 2px;
  }
`;

const TileAmount = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const TileLabel = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
  margin-top: 4px;
  font-weight: 600;
`;

const CustomRow = styled.div`
  background: #1a1612;
  border: 1.5px dashed #2e2618;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, border-style 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #4c7ce0;
    border-style: solid;
    box-shadow: 0 0 0 3px rgba(76, 124, 224, 0.14);
  }

  span.sym {
    font-family: "Inter", sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #a89880;
  }

  input {
    background: transparent;
    border: 0;
    outline: 0;
    flex: 1;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  input::placeholder {
    color: #5a4a38;
    font-weight: 400;
    font-size: 0.95rem;
  }
  span.cur {
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #a89880;
    padding-left: 10px;
    border-left: 1px solid #2e2618;
  }
`;

const Err = styled.p`
  margin: 0;
  color: #e0a94a;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
`;

const OptionalRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 8px;
  padding: 11px 14px;

  &:focus-within {
    border-color: #4c7ce0;
    box-shadow: 0 0 0 3px rgba(76, 124, 224, 0.14);
  }

  input {
    background: transparent;
    border: 0;
    outline: 0;
    width: 100%;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
  }
  input::placeholder {
    color: #5a4a38;
  }
`;

const Submit = styled.button`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 15px 24px;
  border-radius: 10px;
  border: 0;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: box-shadow 0.2s;
  width: 100%;

  &:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Legal = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.74rem;
  color: #5a4a38;
  line-height: 1.55;
  margin: 0;
  padding-top: 12px;
  border-top: 1px dashed #1e1a12;
`;

const PendingBlock = styled.div`
  background: #1a1612;
  border: 1px dashed #e0a94a;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    color: #e0a94a;
    flex-shrink: 0;
    margin-top: 2px;
  }
  h3 {
    font-family: "Cinzel", serif;
    font-size: 1rem;
    color: #e0a94a;
    margin: 0 0 4px;
  }
  p {
    font-family: "Inter", sans-serif;
    font-size: 0.82rem;
    color: #a89880;
    line-height: 1.5;
    margin: 0;
  }
`;

const Success = styled.div`
  background: rgba(76, 124, 224, 0.1);
  border: 1px solid #4c7ce0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
`;

const SuccessIco = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #4c7ce0;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const SuccessAmount = styled.div`
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  color: #f5f0e8;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const SuccessT = styled.p`
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 8px 0 4px;
`;

const SuccessS = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
  margin: 0;
  line-height: 1.5;
`;

const ResetBtn = styled.button`
  background: transparent;
  border: 0;
  color: #7fa3ff;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  margin-top: 10px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export default function DonationCard() {
  const [preset, setPreset] = useState<number | null>(25);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const customNum = custom === "" ? NaN : Number(custom);
  const chosenAmount =
    custom !== ""
      ? Number.isFinite(customNum) && customNum > 0
        ? customNum
        : null
      : preset;

  const inRange =
    chosenAmount !== null && chosenAmount >= MIN && chosenAmount <= MAX;
  const canSubmit = inRange && status !== "submitting";

  let errorText: string | null = null;
  if (custom !== "" && !Number.isFinite(customNum)) {
    errorText = "Enter a number.";
  } else if (chosenAmount !== null && chosenAmount < MIN) {
    errorText = `Minimum donation is $${MIN}.`;
  } else if (chosenAmount !== null && chosenAmount > MAX) {
    errorText = `Maximum donation is $${MAX}. Contact the owner for more.`;
  }

  const pickPreset = (amount: number) => {
    setPreset(amount);
    setCustom("");
  };

  const submit = () => {
    if (!canSubmit) return;
    setStatus("submitting");
    // Stripe is not configured. We surface that honestly and never pretend
    // a charge went through.
    setTimeout(() => setStatus("pending-config"), 400);
  };

  const reset = () => {
    setStatus("idle");
    setPreset(25);
    setCustom("");
    setName("");
    setEmail("");
  };

  if (status === "success") {
    return (
      <Card>
        <Ornament aria-hidden="true" />
        <Eye>Support the project</Eye>
        <Success>
          <SuccessIco aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M4 11l5 5 9-11"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SuccessIco>
          <div>
            <SuccessAmount>
              ${chosenAmount?.toFixed(2) ?? "0.00"}
            </SuccessAmount>
            <SuccessT>Thank you for supporting the project.</SuccessT>
            <SuccessS>
              Your contribution has been recorded. We will post a short update
              by email when the Kickstarter opens.
            </SuccessS>
            <ResetBtn type="button" onClick={reset}>
              Make another donation
            </ResetBtn>
          </div>
        </Success>
      </Card>
    );
  }

  return (
    <Card>
      <Ornament aria-hidden="true" />
      <Eye>Support the project</Eye>
      <Title>Help us ship Sphere of Kings</Title>
      <Sub>A standalone contribution. No product required.</Sub>
      <ChipRow>
        <Chip $tone="muted">
          <strong>USD</strong>
        </Chip>
        <Chip $tone="warn">Amount limits provisional</Chip>
      </ChipRow>

      <Tiles role="group" aria-label="Preset donation amounts">
        {PRESETS.map((p) => (
          <Tile
            key={p.amount}
            type="button"
            $on={custom === "" && preset === p.amount}
            onClick={() => pickPreset(p.amount)}
            aria-pressed={custom === "" && preset === p.amount}
          >
            <TileAmount>${p.amount}</TileAmount>
            <TileLabel>{p.label}</TileLabel>
          </Tile>
        ))}
      </Tiles>

      <div>
        <CustomRow>
          <span className="sym" aria-hidden="true">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="1"
            min={MIN}
            max={MAX}
            placeholder="Enter another amount"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setPreset(null);
            }}
            aria-label="Custom donation amount"
          />
          <span className="cur">USD</span>
        </CustomRow>
        {errorText && <Err style={{ marginTop: 6 }}>{errorText}</Err>}
      </div>

      <OptionalRow>
        <Field>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Your name"
          />
        </Field>
        <Field>
          <input
            type="email"
            placeholder="Email for receipt (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email for receipt"
          />
        </Field>
      </OptionalRow>

      {status === "pending-config" ? (
        <PendingBlock>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 7v5m0 2v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div>
            <h3>Donations are not yet wired to Stripe</h3>
            <p>
              The DonationCard captured{" "}
              <strong style={{ color: "#f5f0e8" }}>
                ${chosenAmount?.toFixed(2) ?? "—"} USD
              </strong>
              . No charge has been attempted. Hook up Stripe to accept
              contributions. We never pretend a payment went through.
            </p>
          </div>
        </PendingBlock>
      ) : (
        <Submit type="button" disabled={!canSubmit} onClick={submit}>
          {status === "submitting"
            ? "Processing…"
            : chosenAmount && inRange
            ? `Support with $${chosenAmount}`
            : "Enter an amount"}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3 7h8m-3-3 3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Submit>
      )}

      <Legal>
        Contributions support product development and community events. Donations
        are not tax-deductible unless stated otherwise. Amount limits and refund
        policy pending owner approval.
      </Legal>
    </Card>
  );
}
