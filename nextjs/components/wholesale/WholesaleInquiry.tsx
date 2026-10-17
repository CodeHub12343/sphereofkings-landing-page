"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { PRODUCTS } from "@/lib/products";

type Row = { slug: string; qty: number };
type DiscountTier = "auto" | "40";
type Status = "idle" | "submitting" | "pending-wire";

const Layout = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(20px, 3vw, 28px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Eye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c9a227;
`;

const Title = styled.h2`
  font-family: "Cinzel", serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: #f5f0e8;
  margin: 0;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #a89880;
  margin: 0;
`;

const Bands = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Band = styled.div<{ $state: "neutral" | "current" | "quote" }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${(p) =>
    p.$state === "current"
      ? "rgba(201,162,39,0.1)"
      : p.$state === "quote"
      ? "rgba(185,28,28,0.08)"
      : "#1a1612"};
  border: 1px solid
    ${(p) =>
      p.$state === "current"
        ? "#c9a227"
        : p.$state === "quote"
        ? "#b91c1c"
        : "#1e1a12"};
`;

const BandRate = styled.span<{ $state: "neutral" | "current" | "quote" }>`
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
  min-width: 54px;
  color: ${(p) =>
    p.$state === "quote" ? "#ff6b7a" : "#f5f0e8"};
  font-variant-numeric: tabular-nums;
`;

const BandRange = styled.span<{ $tbd?: boolean; $strong?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: ${(p) => (p.$tbd ? "#5a4a38" : "#a89880")};
  ${(p) => p.$tbd && "font-style: italic;"}
  ${(p) => p.$strong && "color: #f5f0e8; font-weight: 600;"}
`;

const BandTag = styled.span<{ $tone: "sel" | "quo" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
  background: ${(p) => (p.$tone === "sel" ? "#c9a227" : "#b91c1c")};
  color: #fff;
`;

const Note = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  line-height: 1.55;
  color: #a89880;
  padding: 10px 12px;
  background: #1a1612;
  border-left: 3px solid #e0a94a;
  border-radius: 4px;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label<{ $req?: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #a89880;

  ${(p) => p.$req && `&::after { content: " *"; color: #b91c1c; }`}
`;

const Field = styled.div`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:focus-within {
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }

  input,
  select,
  textarea {
    background: transparent;
    border: 0;
    outline: 0;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    flex: 1;
    width: 100%;
    font-weight: 500;
  }
  textarea {
    resize: vertical;
    min-height: 72px;
    line-height: 1.5;
  }
  input::placeholder,
  textarea::placeholder {
    color: #5a4a38;
  }
  select {
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 2.4fr 90px auto;
  gap: 8px;
  align-items: center;
`;

const RemoveBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    color: #ff6b7a;
    border-color: #b91c1c;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const AddRow = styled.button`
  background: transparent;
  border: 1.5px dashed #2e2618;
  color: #c9a227;
  padding: 10px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    border-color: #c9a227;
    background: rgba(201, 162, 39, 0.06);
  }
`;

const Summary = styled.dl`
  background: #1a1612;
  border-radius: 10px;
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  margin: 0;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    color: #a89880;
  }
  dd {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 700;
    color: #f5f0e8;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-size: 0.88rem;
  }
`;

const Flag = styled.div`
  grid-column: 1 / -1;
  background: rgba(185, 28, 28, 0.08);
  color: #ff6b7a;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
  flex-wrap: wrap;
`;

const BtnPrimary = styled.button<{ $tone?: "primary" | "review" }>`
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 12px 20px;
  border-radius: 8px;
  border: 0;
  cursor: pointer;
  color: ${(p) => (p.$tone === "review" ? "#fff" : "#0a0a0a")};
  background: ${(p) =>
    p.$tone === "review"
      ? "linear-gradient(135deg, #8a1420 0%, #c62b44 50%, #8a1420 100%)"
      : "linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%)"};
  transition: box-shadow 0.2s;

  &:hover:not(:disabled) {
    box-shadow: ${(p) =>
      p.$tone === "review"
        ? "0 0 24px rgba(198, 43, 68, 0.3)"
        : "0 0 24px rgba(240, 192, 64, 0.3)"};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const BtnGhost = styled.button`
  background: transparent;
  border: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 12px 10px;

  &:hover {
    color: #f0c040;
  }
`;

const Success = styled.div`
  background: rgba(79, 176, 125, 0.08);
  border: 1px solid #4fb07d;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;

  svg {
    color: #4fb07d;
    flex-shrink: 0;
    margin-top: 2px;
  }
  h3 {
    font-family: "Cinzel", serif;
    font-size: 1rem;
    color: #4fb07d;
    margin: 0 0 4px;
  }
  p {
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    color: #a89880;
    line-height: 1.55;
    margin: 0 0 6px;
  }
  p:last-child {
    margin: 0;
    font-size: 0.78rem;
    color: #5a4a38;
  }
  button {
    background: transparent;
    border: 0;
    color: #c9a227;
    font-family: "Inter", sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    padding: 0;
    margin-top: 6px;
  }
  button:hover {
    text-decoration: underline;
  }
`;

const BAND_RATES = [5, 10, 20, 30] as const;

function autoTierFor(units: number): number {
  // Provisional, un-approved. Pure visual demo until the owner commits
  // quantity bands. Values are a flat scale so the UI responds to typed
  // quantities — never surfaced as a confirmed policy.
  if (units >= 100) return 30;
  if (units >= 50) return 20;
  if (units >= 24) return 10;
  if (units >= 6) return 5;
  return 0;
}

export default function WholesaleInquiry() {
  const purchasable = useMemo(() => PRODUCTS.filter((p) => p.purchasable), []);
  const [biz, setBiz] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState<Row[]>(() =>
    purchasable[0] ? [{ slug: purchasable[0].slug, qty: 24 }] : [],
  );
  const [tier, setTier] = useState<DiscountTier>("auto");
  const [neededBy, setNeededBy] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const totalUnits = rows.reduce((n, r) => n + (Number.isFinite(r.qty) ? r.qty : 0), 0);
  const auto = autoTierFor(totalUnits);
  const effective = tier === "40" ? 40 : auto;

  const emailOk = /.+@.+\..+/.test(email);
  const canSubmit = biz.trim() && contactName.trim() && emailOk && totalUnits > 0;

  const addRow = () => {
    const next = purchasable.find((p) => !rows.some((r) => r.slug === p.slug));
    if (next) setRows([...rows, { slug: next.slug, qty: 10 }]);
  };
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const submit = () => {
    if (!canSubmit) return;
    setStatus("submitting");
    setTimeout(() => setStatus("pending-wire"), 400);
  };

  const reset = () => {
    setStatus("idle");
    setBiz("");
    setContactName("");
    setEmail("");
    setPhone("");
    setRows(purchasable[0] ? [{ slug: purchasable[0].slug, qty: 24 }] : []);
    setTier("auto");
    setNeededBy("");
    setNotes("");
  };

  if (status === "pending-wire") {
    return (
      <Success role="status">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M4 13l5 5 13-13"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <h3>Thanks — your inquiry is captured locally.</h3>
          <p>
            For <strong style={{ color: "#f5f0e8" }}>{biz}</strong>:{" "}
            {totalUnits} unit{totalUnits === 1 ? "" : "s"} across {rows.length}{" "}
            product{rows.length === 1 ? "" : "s"}, requesting{" "}
            <strong style={{ color: "#f5f0e8" }}>
              {tier === "40" ? "40% (owner review)" : `${auto}% automatic`}
            </strong>
            . We did not email anyone — the wholesale backend is not yet
            wired, so no record was sent.
          </p>
          <p>
            Wire up the admin quote queue and the owner's email relay to turn
            this into a real request.
          </p>
          <button type="button" onClick={reset}>
            Submit another inquiry
          </button>
        </div>
      </Success>
    );
  }

  return (
    <Layout>
      <Card>
        <div>
          <Eye>Wholesale pricing</Eye>
          <Title style={{ marginTop: 6 }}>Automatic bands</Title>
          <Sub style={{ marginTop: 10 }}>
            Discounts apply at checkout once bands are approved. Requests at
            40% go through a quote workflow — they are never auto-applied.
          </Sub>
        </div>
        <Bands>
          {BAND_RATES.map((rate) => {
            const current = tier === "auto" && effective === rate;
            return (
              <Band key={rate} $state={current ? "current" : "neutral"}>
                <BandRate $state={current ? "current" : "neutral"}>{rate}%</BandRate>
                <BandRange $tbd={!current} $strong={current}>
                  {current
                    ? `Current selection · ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`
                    : "Quantity band — to be confirmed"}
                </BandRange>
                {current ? <BandTag $tone="sel">Applied</BandTag> : <span />}
              </Band>
            );
          })}
          <Band $state="quote">
            <BandRate $state="quote">40%</BandRate>
            <BandRange $strong>Contact for pricing · owner review</BandRange>
            <BandTag $tone="quo">Quote</BandTag>
          </Band>
        </Bands>
        <Note>
          Rates are preserved exactly as requested. Quantity bands remain
          provisional until the owner approves them — the 40% tier never
          auto-applies.
        </Note>
      </Card>

      <Card>
        <div>
          <Eye>Request a quote</Eye>
          <Title style={{ marginTop: 6 }}>Wholesale inquiry</Title>
        </div>
        <Row2>
          <Row>
            <Label $req htmlFor="ws-biz">
              Business name
            </Label>
            <Field>
              <input
                id="ws-biz"
                value={biz}
                onChange={(e) => setBiz(e.target.value)}
                placeholder="Northside Toys Ltd."
              />
            </Field>
          </Row>
          <Row>
            <Label $req htmlFor="ws-cn">
              Contact name
            </Label>
            <Field>
              <input
                id="ws-cn"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
              />
            </Field>
          </Row>
        </Row2>
        <Row2>
          <Row>
            <Label $req htmlFor="ws-em">
              Email
            </Label>
            <Field>
              <input
                id="ws-em"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@store.com"
              />
            </Field>
          </Row>
          <Row>
            <Label htmlFor="ws-ph">Phone (optional)</Label>
            <Field>
              <input
                id="ws-ph"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </Field>
          </Row>
        </Row2>

        <Row>
          <Label>Products and quantities</Label>
          <Items>
            {rows.map((r, i) => (
              <Item key={i}>
                <Field>
                  <select
                    value={r.slug}
                    onChange={(e) => updateRow(i, { slug: e.target.value })}
                    aria-label={`Product for row ${i + 1}`}
                  >
                    {purchasable.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field style={{ justifyContent: "center" }}>
                  <input
                    type="number"
                    min={1}
                    max={10_000}
                    value={r.qty}
                    onChange={(e) =>
                      updateRow(i, { qty: Math.max(0, Number(e.target.value) || 0) })
                    }
                    style={{
                      textAlign: "center",
                      fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
                      fontWeight: 700,
                    }}
                    aria-label={`Quantity for row ${i + 1}`}
                  />
                </Field>
                <RemoveBtn
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove row ${i + 1}`}
                >
                  ✕
                </RemoveBtn>
              </Item>
            ))}
            {rows.length < purchasable.length && (
              <AddRow type="button" onClick={addRow}>
                + Add another product
              </AddRow>
            )}
          </Items>
        </Row>

        <Row2>
          <Row>
            <Label htmlFor="ws-dl">Requested discount</Label>
            <Field>
              <select
                id="ws-dl"
                value={tier}
                onChange={(e) => setTier(e.target.value as DiscountTier)}
              >
                <option value="auto">
                  Automatic — {auto}% ({totalUnits} unit{totalUnits === 1 ? "" : "s"})
                </option>
                <option value="40">40% · Contact for pricing</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Label htmlFor="ws-nd">Needed by</Label>
            <Field>
              <input
                id="ws-nd"
                type="text"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                placeholder="e.g. December 20, 2026"
              />
            </Field>
          </Row>
        </Row2>

        <Row>
          <Label htmlFor="ws-no">Additional information</Label>
          <Field>
            <textarea
              id="ws-no"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery address, retail store context, anything the owner should know."
            />
          </Field>
        </Row>

        <Summary>
          <dt>Line items</dt>
          <dd>
            {rows.length} · {totalUnits} unit{totalUnits === 1 ? "" : "s"}
          </dd>
          <dt>Discount band</dt>
          <dd style={{ color: tier === "40" ? "#ff6b7a" : "#f0c040" }}>
            {tier === "40" ? "40% (owner review)" : `${auto}% (automatic)`}
          </dd>
          <dt>Estimated reply</dt>
          <dd>Within 2 business days</dd>
          {tier === "40" && (
            <Flag>
              Owner approval required for the 40% tier — the submit action
              becomes "Submit for owner review".
            </Flag>
          )}
        </Summary>

        <Actions>
          <BtnGhost type="button">Save as draft</BtnGhost>
          <BtnPrimary
            type="button"
            $tone={tier === "40" ? "review" : "primary"}
            disabled={!canSubmit || status === "submitting"}
            onClick={submit}
          >
            {status === "submitting"
              ? "Submitting…"
              : tier === "40"
              ? "Submit for owner review"
              : "Request a quote"}
          </BtnPrimary>
        </Actions>
      </Card>
    </Layout>
  );
}
