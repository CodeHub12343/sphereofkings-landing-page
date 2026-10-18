"use client";

import { useEffect, useState, useTransition } from "react";
import styled from "styled-components";
import Link from "next/link";
import DeliveryNotice from "@/components/shop/DeliveryNotice";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/products";
import { AFF_ATTR_COOKIE } from "@/lib/affiliate-auth";
import { resolveAffiliateAction } from "@/app/checkout/affiliate-actions";
import {
  createPaymentIntentAction,
  createPendingOrderAction,
  PaymentIntentResult,
} from "@/app/checkout/actions";
import StripePayment from "./StripePayment";

type Step = "contact" | "shipping" | "review" | "pay";
const STEP_ORDER: Step[] = ["contact", "shipping", "review", "pay"];
const STEP_LABEL: Record<Step, string> = {
  contact: "Contact",
  shipping: "Shipping",
  review: "Review",
  pay: "Pay",
};

const Stage = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(20px, 3vw, 32px);
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 32px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const Rail = styled.ol`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0 0 24px;

  @media (max-width: 540px) {
    gap: 6px;
  }
`;

const RailStep = styled.li<{ $state: "done" | "on" | "pending" }>`
  padding: 12px 14px;
  background: ${(p) => (p.$state === "on" ? "#0e0c09" : "#0a0a0a")};
  border: 1px solid
    ${(p) => (p.$state === "pending" ? "#1e1a12" : "#c9a227")};
  box-shadow: ${(p) =>
    p.$state === "on" ? "0 0 0 1px rgba(201, 162, 39, 0.4)" : "none"};
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  background: ${(p) =>
    p.$state === "done" ? "rgba(201,162,39,0.08)" : "#0a0a0a"};

  @media (max-width: 540px) {
    flex-direction: column;
    gap: 6px;
    padding: 10px 6px;
    text-align: center;
    justify-content: center;
  }
`;

const RailNo = styled.span<{ $state: "done" | "on" | "pending" }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  flex-shrink: 0;
  background: ${(p) =>
    p.$state === "done" ? "#c9a227" : p.$state === "on" ? "transparent" : "#0e0c09"};
  color: ${(p) =>
    p.$state === "done" ? "#0a0a0a" : p.$state === "on" ? "#f0c040" : "#5a4a38"};
  border: 1px solid
    ${(p) =>
      p.$state === "done" ? "#c9a227" : p.$state === "on" ? "#c9a227" : "#2e2618"};
`;

const RailBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
`;

const RailK = styled.span<{ $state: "done" | "on" | "pending" }>`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  color: ${(p) =>
    p.$state === "pending" ? "#5a4a38" : "#f0c040"};

  @media (max-width: 540px) {
    font-size: 0.6rem;
    letter-spacing: 0.06em;
  }
`;

const RailV = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f5f0e8;
  margin-top: 2px;

  @media (max-width: 540px) {
    display: none;
  }
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0 0 6px;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #a89880;
  margin: 0 0 20px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;

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
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }

  input,
  select {
    background: transparent;
    border: 0;
    outline: 0;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    flex: 1;
    width: 100%;
  }
  input::placeholder {
    color: #5a4a38;
  }
  select {
    appearance: none;
    -webkit-appearance: none;
  }
`;

const Terms = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid #c9a227;
  border-radius: 10px;
  margin: 14px 0;
  cursor: pointer;

  input {
    margin-top: 2px;
    width: 16px;
    height: 16px;
    accent-color: #c9a227;
    flex-shrink: 0;
  }

  div p:first-child {
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: #f5f0e8;
    margin: 0 0 2px;
  }
  div p:last-child {
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    color: #a89880;
    margin: 0;
    line-height: 1.5;
  }
`;

const Foot = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid #1e1a12;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
`;

const Back = styled.button`
  background: transparent;
  border: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #f0c040;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Primary = styled.button`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 14px 24px;
  border-radius: 10px;
  border: 0;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: box-shadow 0.2s;

  &:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const SummaryLine = styled.div`
  padding: 12px 14px;
  background: #1a1612;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    font-weight: 700;
    margin-bottom: 2px;
  }
  dd {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    color: #f5f0e8;
  }
  button {
    background: transparent;
    border: 0;
    color: #c9a227;
    font-weight: 700;
    font-size: 0.72rem;
    cursor: pointer;
    align-self: center;
  }
  button:hover {
    text-decoration: underline;
  }
`;

const Side = styled.aside`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-self: start;
`;

const SideH = styled.h2`
  font-family: "Cinzel", serif;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #f5f0e8;
`;

const Item = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Thumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #0a0a0a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f5f0e8;
`;

const ItemMeta = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  color: #a89880;
`;

const ItemPrice = styled.span<{ $muted?: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 10px;
  padding-top: 10px;
  border-top: 1px dashed #2e2618;
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
    font-size: 0.85rem;
  }
  dd.muted {
    color: #5a4a38;
    font-weight: 500;
    font-style: italic;
    font-size: 0.78rem;
  }
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #2e2618;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  color: #f5f0e8;

  span:last-child {
    font-size: 1.3rem;
    font-variant-numeric: tabular-nums;
  }
`;

const PayBlock = styled.div`
  padding: 20px;
  background: #1a1612;
  border: 1px dashed #e0a94a;
  border-radius: 12px;
  display: flex;
  gap: 14px;
  align-items: flex-start;

  svg {
    color: #e0a94a;
    flex-shrink: 0;
    margin-top: 2px;
  }
  h3 {
    font-family: "Cinzel", serif;
    font-size: 1.1rem;
    color: #e0a94a;
    margin: 0 0 6px;
  }
  p {
    font-family: "Inter", sans-serif;
    font-size: 0.88rem;
    color: #a89880;
    line-height: 1.55;
    margin: 0 0 10px;
  }
  p:last-child {
    margin: 0;
  }
`;

const NotifyLink = styled(Link)`
  display: inline-block;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e0a94a;
  color: #e0a94a;
  text-decoration: none;

  &:hover {
    background: rgba(224, 169, 74, 0.08);
  }
`;

const EmptyCard = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  color: #a89880;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.25rem;
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 0.92rem;
  }
`;

const BrowseBtn = styled(Link)`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  text-decoration: none;
`;

export default function CheckoutStepper() {
  const { lines, hasUnapprovedPrice } = useCart();
  const [step, setStep] = useState<Step>("contact");

  // Totals for the summary panel and the Pay CTA. We only sum lines
  // with approved prices; `hasUnapprovedPrice` controls whether we
  // show the amount or the "price pending" state.
  const subtotal = lines.reduce((n, l) => {
    if (!l.product.priceApproved || !l.product.price) return n;
    return n + l.product.price.amount * l.qty;
  }, 0);
  const currency =
    lines.find((l) => l.product.price)?.product.price?.currency ?? "USD";
  const subtotalDisplay = hasUnapprovedPrice
    ? "price pending"
    : formatMoney(subtotal, currency);
  const totalDisplay = hasUnapprovedPrice ? "$—" : formatMoney(subtotal, currency);

  const [contact, setContact] = useState({ email: "", phone: "" });
  const [ship, setShip] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postal: "",
    country: "United Kingdom",
  });
  const [terms, setTerms] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [affiliateName, setAffiliateName] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [intentResult, setIntentResult] = useState<PaymentIntentResult | null>(
    null,
  );
  const [, startTransition] = useTransition();

  // When we land on the Pay step with an order ref, ask the server to
  // create (or re-use) a Stripe payment intent. The result tells the
  // UI whether to show the Payment Element, a "stripe not wired" note,
  // or a price-pending note.
  useEffect(() => {
    if (step !== "pay" || !orderRef) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await createPaymentIntentAction(orderRef);
      if (!cancelled) setIntentResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [step, orderRef]);

  // Pick up a referral-attribution cookie if one was dropped by
  // /r/[code] and resolve it against Mongo via a server action so BOTH
  // the seeded sample codes AND self-signup SOV-xxx-xxxx codes
  // surface here.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${AFF_ATTR_COOKIE}=([^;]+)`),
    );
    if (!match) return;
    const raw = decodeURIComponent(match[1]);
    let cancelled = false;
    (async () => {
      const resolved = await resolveAffiliateAction(raw).catch(() => null);
      if (cancelled || !resolved) return;
      setAffiliateCode(resolved.code);
      setAffiliateName(resolved.displayName);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (lines.length === 0) {
    return (
      <EmptyCard>
        <h2>Nothing to check out yet.</h2>
        <p>Add a product first, then come back to complete your order.</p>
        <BrowseBtn href="/shop">Browse the shop</BrowseBtn>
      </EmptyCard>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);
  const go = (s: Step) => setStep(s);
  const next = () => setStep(STEP_ORDER[stepIndex + 1] ?? step);
  const back = () => setStep(STEP_ORDER[stepIndex - 1] ?? step);

  const stateOf = (s: Step): "done" | "on" | "pending" => {
    const i = STEP_ORDER.indexOf(s);
    if (i < stepIndex) return "done";
    if (i === stepIndex) return "on";
    return "pending";
  };

  const contactValid = /.+@.+\..+/.test(contact.email);
  const shipValid =
    ship.name.trim() && ship.line1.trim() && ship.city.trim() && ship.postal.trim();

  return (
    <Stage>
      <div>
        <Rail aria-label="Checkout progress">
          {STEP_ORDER.map((s, i) => {
            const st = stateOf(s);
            return (
              <RailStep key={s} $state={st}>
                <RailNo $state={st}>
                  {st === "done" ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </RailNo>
                <RailBody>
                  <RailK $state={st}>Step {i + 1}</RailK>
                  <RailV>{STEP_LABEL[s]}</RailV>
                </RailBody>
              </RailStep>
            );
          })}
        </Rail>

        {step === "contact" && (
          <>
            <Title>Where should we send your receipt?</Title>
            <Sub>We use this to confirm your preorder and send tracking later.</Sub>
            <Row>
              <Label htmlFor="email" $req>
                Email
              </Label>
              <Field>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </Field>
            </Row>
            <Row>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Field>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+44 7700 900 101"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
                  }
                />
              </Field>
            </Row>
            <Foot>
              <Link
                href="/shop"
                style={{
                  color: "#a89880",
                  fontFamily: "Inter",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                ← Back to shop
              </Link>
              <Primary type="button" disabled={!contactValid} onClick={next}>
                Continue to shipping
              </Primary>
            </Foot>
          </>
        )}

        {step === "shipping" && (
          <>
            <Title>Where should we ship it?</Title>
            <Sub>We will ship Early Bird orders in the sequence they are paid.</Sub>
            <Row>
              <Label htmlFor="name" $req>
                Full name
              </Label>
              <Field>
                <input
                  id="name"
                  autoComplete="name"
                  value={ship.name}
                  onChange={(e) => setShip({ ...ship, name: e.target.value })}
                />
              </Field>
            </Row>
            <Row>
              <Label htmlFor="line1" $req>
                Address
              </Label>
              <Field>
                <input
                  id="line1"
                  autoComplete="address-line1"
                  value={ship.line1}
                  onChange={(e) => setShip({ ...ship, line1: e.target.value })}
                />
              </Field>
            </Row>
            <Row>
              <Label htmlFor="line2">Apartment, suite, etc.</Label>
              <Field>
                <input
                  id="line2"
                  autoComplete="address-line2"
                  value={ship.line2}
                  onChange={(e) => setShip({ ...ship, line2: e.target.value })}
                />
              </Field>
            </Row>
            <Row2>
              <Row>
                <Label htmlFor="city" $req>
                  City
                </Label>
                <Field>
                  <input
                    id="city"
                    autoComplete="address-level2"
                    value={ship.city}
                    onChange={(e) => setShip({ ...ship, city: e.target.value })}
                  />
                </Field>
              </Row>
              <Row>
                <Label htmlFor="postal" $req>
                  Postal code
                </Label>
                <Field>
                  <input
                    id="postal"
                    autoComplete="postal-code"
                    value={ship.postal}
                    onChange={(e) => setShip({ ...ship, postal: e.target.value })}
                  />
                </Field>
              </Row>
            </Row2>
            <Row>
              <Label htmlFor="country" $req>
                Country
              </Label>
              <Field>
                <select
                  id="country"
                  autoComplete="country-name"
                  value={ship.country}
                  onChange={(e) => setShip({ ...ship, country: e.target.value })}
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Nigeria</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </Field>
            </Row>
            <Foot>
              <Back type="button" onClick={back}>
                ← Back to contact
              </Back>
              <Primary type="button" disabled={!shipValid} onClick={next}>
                Continue to review
              </Primary>
            </Foot>
          </>
        )}

        {step === "review" && (
          <>
            <Title>Review your order</Title>
            <Sub>Confirm everything before you pay. You can go back to edit any step.</Sub>
            <SummaryLine>
              <div>
                <dt>Contact</dt>
                <dd>
                  {contact.email}
                  {contact.phone ? ` · ${contact.phone}` : ""}
                </dd>
              </div>
              <button type="button" onClick={() => go("contact")}>
                Edit
              </button>
            </SummaryLine>
            <SummaryLine>
              <div>
                <dt>Ship to</dt>
                <dd>
                  {ship.name} · {ship.line1}
                  {ship.line2 ? `, ${ship.line2}` : ""} · {ship.city} {ship.postal} ·{" "}
                  {ship.country}
                </dd>
              </div>
              <button type="button" onClick={() => go("shipping")}>
                Edit
              </button>
            </SummaryLine>
            {affiliateCode && (
              <SummaryLine>
                <div>
                  <dt>Attribution</dt>
                  <dd>
                    Affiliate · <strong style={{ color: "#f0c040" }}>{affiliateCode}</strong>
                    {affiliateName ? ` · ${affiliateName}` : ""}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAffiliateCode(null);
                    setAffiliateName(null);
                    // Clear the cookie so a refresh doesn't bring it back.
                    document.cookie = `${AFF_ATTR_COOKIE}=; path=/; max-age=0`;
                  }}
                >
                  Clear
                </button>
              </SummaryLine>
            )}
            <Terms>
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <div>
                <p>I understand this is a Christmas Early Bird preorder.</p>
                <p>
                  Deliveries start December 1, 2026. We ship in the sequence
                  orders are paid; not every parcel will arrive on December 1.
                </p>
              </div>
            </Terms>
            {orderError && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  color: "#ff6b7a",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                }}
              >
                {orderError}
              </p>
            )}
            <Foot>
              <Back type="button" onClick={back}>
                ← Back to shipping
              </Back>
              <Primary
                type="button"
                disabled={!terms}
                onClick={() => {
                  // Save a pending order first so the admin queue sees
                  // the record even though Pay still blocks.
                  setOrderError(null);
                  startTransition(async () => {
                    const result = await createPendingOrderAction({
                      customerName: ship.name,
                      customerEmail: contact.email,
                      customerPhone: contact.phone || undefined,
                      affiliateCode: affiliateCode ?? undefined,
                      lines: lines.map((l) => ({
                        slug: l.slug,
                        name: l.product.name,
                        qty: l.qty,
                      })),
                      totalDisplay,
                      shipTo: {
                        name: ship.name,
                        line1: ship.line1,
                        line2: ship.line2 || undefined,
                        city: ship.city,
                        postal: ship.postal,
                        country: ship.country,
                      },
                    });
                    if (!result.ok) {
                      setOrderError(result.error);
                      return;
                    }
                    setOrderRef(result.ref);
                    next();
                  });
                }}
              >
                Continue to payment
              </Primary>
            </Foot>
          </>
        )}

        {step === "pay" && (
          <>
            <Title>Payment</Title>
            <Sub>Stripe payment will appear here once pricing is approved.</Sub>
            {orderRef && (
              <p
                style={{
                  margin: 0,
                  color: "#4fb07d",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                }}
              >
                Order{" "}
                <strong
                  style={{
                    fontFamily:
                      "SFMono-Regular, Menlo, Consolas, monospace",
                    color: "#f0c040",
                  }}
                >
                  {orderRef}
                </strong>{" "}
                saved. We will finalise the charge once pricing is
                approved and Stripe is wired.
              </p>
            )}
            {intentResult && intentResult.ok ? (
              <StripePayment
                clientSecret={intentResult.clientSecret}
                publishableKey={intentResult.publishableKey}
                amountMinor={intentResult.amountMinor}
                returnUrl={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/order/${orderRef}`
                    : `/order/${orderRef}`
                }
              />
            ) : intentResult && !intentResult.ok ? (
              <PayBlock>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M11 7v5m0 2v.3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  {intentResult.reason === "price-pending" ? (
                    <>
                      <h3>Pay unlocks once prices are approved</h3>
                      <p>
                        The owner is finalising prices for one of the items in
                        your cart (<code
                          style={{
                            fontFamily:
                              "SFMono-Regular, Menlo, Consolas, monospace",
                            color: "#f0c040",
                          }}
                        >
                          {intentResult.slug}
                        </code>
                        ). Your selection and shipping details are saved —
                        this step enables automatically once the price is
                        approved.
                      </p>
                      <NotifyLink href="/#signup">Notify me</NotifyLink>
                    </>
                  ) : intentResult.reason === "stripe-not-wired" ? (
                    <>
                      <h3>Stripe integration — not yet wired</h3>
                      <p>
                        Set <strong>STRIPE_SECRET_KEY</strong>,{" "}
                        <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</strong>,
                        and <strong>STRIPE_WEBHOOK_SECRET</strong> in your
                        environment to enable the real Payment Element and
                        confirmation flow.
                      </p>
                    </>
                  ) : intentResult.reason === "order-not-found" ? (
                    <>
                      <h3>Order not found</h3>
                      <p>
                        We couldn't locate the order record for this session.
                        Go back a step and try again.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3>Something went wrong</h3>
                      <p>{intentResult.message}</p>
                    </>
                  )}
                </div>
              </PayBlock>
            ) : (
              <PayBlock>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <div>
                  <h3>Preparing payment…</h3>
                  <p>Loading the secure form from Stripe.</p>
                </div>
              </PayBlock>
            )}
            <Foot>
              <Back type="button" onClick={back}>
                ← Back to review
              </Back>
              <Primary type="button" disabled>
                Pay {totalDisplay} now
              </Primary>
            </Foot>
          </>
        )}
      </div>

      <Side>
        <SideH>Order summary</SideH>
        {lines.map((l) => (
          <Item key={l.slug}>
            <Thumb>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.image} alt="" />
            </Thumb>
            <ItemBody>
              <ItemName>{l.product.name}</ItemName>
              <ItemMeta>Qty {l.qty} · Early Bird</ItemMeta>
            </ItemBody>
            <ItemPrice $muted={!l.product.priceApproved}>
              {l.product.priceApproved && l.product.price
                ? formatMoney(
                    l.product.price.amount * l.qty,
                    l.product.price.currency,
                  )
                : "$—"}
            </ItemPrice>
          </Item>
        ))}
        <Rows>
          <dt>Subtotal</dt>
          <dd className={hasUnapprovedPrice ? "muted" : ""}>
            {subtotalDisplay}
          </dd>
          {affiliateCode && (
            <>
              <dt>Affiliate · {affiliateCode}</dt>
              <dd className="muted">applied at checkout</dd>
            </>
          )}
          <dt>Shipping</dt>
          <dd className="muted">calculated at checkout</dd>
          <dt>Tax</dt>
          <dd className="muted">calculated at checkout</dd>
        </Rows>
        <Total>
          <span>Total</span>
          <span>{totalDisplay}</span>
        </Total>
        <DeliveryNotice variant="early-bird" />
      </Side>
    </Stage>
  );
}
