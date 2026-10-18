"use client";

import styled from "styled-components";
import Link from "next/link";
import { SampleOrder, PaymentState, FulfillmentState } from "@/lib/sample-orders";

type Variant = "paid" | "confirming" | "failed" | "refunded";

function variantFor(p: PaymentState): Variant {
  if (p === "paid") return "paid";
  if (p === "failed") return "failed";
  if (p === "refund-pending" || p === "refunded" || p === "partially-refunded")
    return "refunded";
  return "confirming";
}

const Shell = styled.article`
  display: grid;
  gap: 20px;
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 16px;
  padding: clamp(24px, 4vw, 36px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c9a227, transparent);
  }
`;

const Mark = styled.div<{ $variant: Variant }>`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  align-self: center;
  position: relative;
  color: ${(p) =>
    p.$variant === "paid"
      ? "#0a0a0a"
      : p.$variant === "failed"
      ? "#fff"
      : "#c9a227"};
  background: ${(p) =>
    p.$variant === "paid"
      ? "radial-gradient(circle at 32% 28%, #e7cb70 0%, #d4af37 25%, #8a6e1f 60%, #1a1510 85%)"
      : p.$variant === "failed"
      ? "radial-gradient(circle at 32% 28%, #e78591 0%, #c62b44 50%, #4a0a16 90%)"
      : "radial-gradient(circle at 32% 28%, #e7cb70 0%, #8a6e1f 40%, #1a1510 85%)"};

  &::after {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 1px solid
      ${(p) =>
        p.$variant === "paid"
          ? "#c9a227"
          : p.$variant === "failed"
          ? "#c62b44"
          : "#8a6e1f"};
    opacity: 0.4;
  }
`;

const Head = styled.header`
  text-align: center;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0 0 6px;
  font-weight: 800;
`;

const Sub = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  color: #a89880;
  margin: 0;
  line-height: 1.55;
`;

const RefRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const RefK = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  color: #a89880;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
`;

const RefV = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f5f0e8;
`;

const CopyBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }

  @media print {
    display: none;
  }
`;

const Badges = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const Pill = styled.span<{ $tone: "paid" | "pending" | "failed" | "refund" | "eb" | "ks" | "wh" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  ${(p) => {
    if (p.$tone === "paid")
      return "background: rgba(79,176,125,0.14); color: #4fb07d;";
    if (p.$tone === "pending")
      return "background: rgba(224,169,74,0.14); color: #e0a94a;";
    if (p.$tone === "failed")
      return "background: rgba(185,28,28,0.14); color: #ff6b7a;";
    if (p.$tone === "refund")
      return "background: #1a1612; color: #a89880;";
    if (p.$tone === "eb")
      return "background: rgba(201,162,39,0.14); color: #f0c040;";
    if (p.$tone === "ks")
      return "background: rgba(76,124,224,0.14); color: #7fa3ff;";
    return "background: #1a1612; color: #f5f0e8; border: 1px solid #2e2618;";
  }}
`;

const PillDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

const SpinnerSm = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: oc-spin 700ms linear infinite;
  display: inline-block;

  @keyframes oc-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce), print {
    animation: none;
  }
`;

const Panel = styled.div`
  background: #1a1612;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 10px;
  margin: 0;
  font-family: "Inter", sans-serif;

  dt {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 700;
    color: #a89880;
  }
  dd {
    margin: 0;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    color: #f5f0e8;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-size: 0.88rem;
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
  align-items: baseline;

  span:last-child {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 1.4rem;
    font-variant-numeric: tabular-nums;
  }
`;

const Ship = styled.div`
  background: #1a1612;
  border-radius: 10px;
  padding: 14px 16px;
`;

const ShipK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: #a89880;
  margin-bottom: 4px;
`;

const ShipV = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #f5f0e8;
  white-space: pre-line;

  small {
    display: block;
    color: #a89880;
    font-size: 0.78rem;
    margin-top: 4px;
  }
`;

/* ---------------- Fulfillment tracker ---------------- */

const Track = styled.section`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TrackHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;

  h3 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.05rem;
    margin: 0;
    font-weight: 700;
  }
`;

const TrackHint = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const Rail = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  position: relative;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const RailStep = styled.li<{ $state: "done" | "active" | "pending" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  position: relative;
  color: ${(p) =>
    p.$state === "done"
      ? "#4fb07d"
      : p.$state === "active"
      ? "#f0c040"
      : "#5a4a38"};

  /* Connecting line between dots (desktop). The last item has no line
     after it. */
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 13px;
    left: calc(50% + 18px);
    right: calc(-50% + 18px);
    height: 2px;
    background: ${(p) => (p.$state === "done" ? "#4fb07d" : "#2e2618")};

    @media (max-width: 540px) {
      display: none;
    }
  }
`;

const RailDot = styled.span<{ $state: "done" | "active" | "pending" }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${(p) =>
    p.$state === "done"
      ? "#4fb07d"
      : p.$state === "active"
      ? "rgba(240, 192, 64, 0.14)"
      : "#0e0c09"};
  color: ${(p) => (p.$state === "done" ? "#0a0a0a" : "currentColor")};
  border: 2px solid
    ${(p) =>
      p.$state === "done"
        ? "#4fb07d"
        : p.$state === "active"
        ? "#f0c040"
        : "#2e2618"};
  flex-shrink: 0;
`;

const RailLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f5f0e8;
`;

const RailSub = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const NextSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Next = styled.div<{ $muted?: boolean }>`
  padding: 14px;
  background: #1a1612;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: ${(p) => (p.$muted ? 0.6 : 1)};
`;

const NextIco = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(201, 162, 39, 0.12);
  color: #c9a227;
  display: grid;
  place-items: center;
`;

const NextT = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f5f0e8;
`;

const NextS = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  line-height: 1.5;
  margin: 0;
`;

const Alert = styled.div<{ $tone: "warn" | "crim" }>`
  background: ${(p) =>
    p.$tone === "warn"
      ? "rgba(224,169,74,0.08)"
      : "rgba(185,28,28,0.08)"};
  border: 1px solid
    ${(p) => (p.$tone === "warn" ? "#e0a94a" : "#c62b44")};
  border-radius: 10px;
  padding: 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  line-height: 1.55;
  color: ${(p) => (p.$tone === "warn" ? "#e0a94a" : "#ff6b7a")};
  display: flex;
  gap: 10px;
  align-items: flex-start;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
  strong {
    color: #f5f0e8;
  }
  p {
    margin: 0 0 6px;
  }
  p:last-child {
    margin: 0;
  }
`;

const Actions = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid #1e1a12;

  @media print {
    display: none;
  }
`;

const BtnPrint = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  border-radius: 8px;
  padding: 10px 18px;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.25);
  }
`;

const BtnBack = styled(Link)`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;

  &:hover {
    color: #f0c040;
  }
`;

const DemoBar = styled.aside`
  background: rgba(224, 169, 74, 0.08);
  border: 1px solid #e0a94a;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #e0a94a;
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 1.4;

  strong {
    color: #f5f0e8;
  }
  svg {
    flex-shrink: 0;
  }

  @media print {
    display: none;
  }
`;

const PrintOnlyMeta = styled.div`
  display: none;

  @media print {
    display: block;
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: 0.75rem;
    color: #000;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;

    strong {
      display: block;
      font-family: "Cinzel", serif;
      font-size: 1.1rem;
      margin-bottom: 4px;
    }
  }
`;

// Force a readable black-ink receipt when printing. We rewrite the dark
// palette to Parchment so the exact same markup prints cleanly.
const PrintReset = styled.div`
  @media print {
    &,
    * {
      color: #000 !important;
      background: transparent !important;
      border-color: #ccc !important;
      box-shadow: none !important;
      animation: none !important;
    }
    section,
    article {
      border: 1px solid #ccc !important;
      border-radius: 0 !important;
    }
    ${Mark}, ${Mark}::after {
      display: none !important;
    }
  }
`;

export default function OrderConfirmation({
  order,
  isDemo = false,
}: {
  order: SampleOrder;
  isDemo?: boolean;
}) {
  const variant = variantFor(order.payment);

  const title =
    variant === "paid"
      ? "Order confirmed."
      : variant === "confirming"
      ? "Confirming your payment…"
      : variant === "failed"
      ? "Payment failed — no charge taken."
      : "Order is being adjusted.";

  const sub =
    variant === "paid"
      ? `Thank you, ${order.customerName.split(" ")[0]}. Your receipt is below.`
      : variant === "confirming"
      ? "Stripe is sending us the final confirmation. This usually takes a few seconds."
      : variant === "failed"
      ? "Your bank declined the charge. Your card has not been debited."
      : "A refund or adjustment is in progress on this order.";

  return (
    <PrintReset>
      <PrintOnlyMeta aria-hidden="true">
        <strong>Sphere of Kings — Receipt</strong>
        {order.ref} · Printed {new Date().toLocaleDateString()}
      </PrintOnlyMeta>
      <Shell>
        {isDemo && (
          <DemoBar role="note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M8 4.5v4m0 2v.3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>
              <strong>Demo view.</strong> Orders don't persist yet — this page
              reads from the admin sample data so the different states can be
              reviewed. Wire real orders and the Stripe webhook before shipping.
            </span>
          </DemoBar>
        )}
        <Card>
          <Mark $variant={variant} aria-hidden="true">
            {variant === "paid" ? (
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M8 15l5 5 10-11"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : variant === "failed" ? (
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M9 9l12 12M21 9 9 21"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <SpinnerSm style={{ width: 22, height: 22, borderWidth: 3 }} />
            )}
          </Mark>

          <Head>
            <Title>{title}</Title>
            <Sub>{sub}</Sub>
          </Head>

          <RefRow>
            <RefK>Order</RefK>
            <RefV>{order.ref}</RefV>
            <CopyBtn
              type="button"
              aria-label="Copy order reference"
              onClick={() => navigator.clipboard?.writeText(order.ref)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 6V2.5a0.5 0.5 0 0 1 0.5-0.5H7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </CopyBtn>
          </RefRow>

          <Badges>
            {variant === "paid" && (
              <Pill $tone="paid">
                <PillDot aria-hidden="true" />
                Paid · Stripe confirmed
              </Pill>
            )}
            {variant === "confirming" && (
              <Pill $tone="pending">
                <SpinnerSm aria-hidden="true" />
                Awaiting webhook
              </Pill>
            )}
            {variant === "failed" && (
              <Pill $tone="failed">
                <PillDot aria-hidden="true" />
                Failed · no charge
              </Pill>
            )}
            {variant === "refunded" && (
              <Pill $tone="refund">
                {order.payment === "refund-pending"
                  ? "Refund pending"
                  : order.payment === "refunded"
                  ? "Refunded"
                  : "Partially refunded"}
              </Pill>
            )}
            {order.origin === "early-bird" && (
              <Pill $tone="eb">Christmas Early Bird</Pill>
            )}
            {order.origin === "kickstarter" && <Pill $tone="ks">Kickstarter</Pill>}
            {order.origin === "wholesale" && <Pill $tone="wh">Wholesale</Pill>}
          </Badges>

          <Panel>
            <Rows>
              <dt>Items</dt>
              <dd style={{ textAlign: "right", fontFamily: "inherit", fontWeight: 500 }}>
                {order.itemSummary}
              </dd>
              <dt>Subtotal</dt>
              <dd>{order.totalDisplay}</dd>
              {order.affiliateCode && (
                <>
                  <dt>Affiliate · {order.affiliateCode}</dt>
                  <dd style={{ color: "#4fb07d" }}>− $—</dd>
                </>
              )}
              <dt>Shipping</dt>
              <dd>$—</dd>
              <dt>Tax</dt>
              <dd>$—</dd>
            </Rows>
            <Total>
              <span>Total {variant === "paid" ? "charged" : ""}</span>
              <span>{order.totalDisplay}</span>
            </Total>
          </Panel>

          <Ship>
            <ShipK>Ship to</ShipK>
            <ShipV>
              {order.shipTo ? (
                <>
                  {order.shipTo.name}
                  {"\n"}
                  {order.shipTo.line1}
                  {order.shipTo.line2 ? `\n${order.shipTo.line2}` : ""}
                  {"\n"}
                  {order.shipTo.city}
                  {order.shipTo.postal ? ` ${order.shipTo.postal}` : ""}
                  {"\n"}
                  {order.shipTo.country}
                </>
              ) : (
                <>
                  {order.customerName}
                  {"\n"}
                  Shipping address not on file for this order.
                </>
              )}
              <small>
                Deliveries start December 1, 2026 — orders ship in the sequence
                they are paid.
              </small>
            </ShipV>
          </Ship>

          {variant === "paid" && (
            <>
              <FulfillmentTracker fulfillment={order.fulfillment} />
              <NextSteps>
                <Next>
                  <NextIco aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M3 4l4 3 4-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </NextIco>
                  <NextT>Receipt by email</NextT>
                  <NextS>A full receipt is on its way to the email on file.</NextS>
                </Next>
                <Next $muted={order.fulfillment !== "dispatched"}>
                  <NextIco aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="4" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="5" cy="12" r="1" fill="currentColor" />
                      <circle cx="10" cy="12" r="1" fill="currentColor" />
                    </svg>
                  </NextIco>
                  <NextT>
                    {order.fulfillment === "dispatched"
                      ? "On its way"
                      : "Tracking later"}
                  </NextT>
                  <NextS>
                    {order.fulfillment === "dispatched"
                      ? "A tracking email has been sent to the address on file."
                      : "We will send a tracking number when your parcel leaves the workshop."}
                  </NextS>
                </Next>
                <Next $muted>
                  <NextIco aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </NextIco>
                  <NextT>Fulfillment in sequence</NextT>
                  <NextS>
                    We ship in the order payments were confirmed. Not every
                    parcel arrives December 1.
                  </NextS>
                </Next>
              </NextSteps>
            </>
          )}

          {variant === "confirming" && (
            <Alert $tone="warn" role="status">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v5m0 2v.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div>
                <p>
                  <strong>Taking a few seconds.</strong> Your card has been
                  authorised, but we have not yet received the final
                  confirmation from Stripe. Keep this page open — it will
                  update on its own.
                </p>
                <p style={{ fontSize: "0.78rem" }}>
                  We never show "Paid" before the webhook confirms it. Your
                  card is safe.
                </p>
              </div>
            </Alert>
          )}

          {variant === "failed" && (
            <Alert $tone="crim" role="status">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v5m0 2v.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div>
                <p>
                  <strong>Your card was declined.</strong> No amount has been
                  taken. You can retry from checkout with the same cart.
                </p>
                <p style={{ fontSize: "0.78rem" }}>
                  Your email, address and selection are kept — nothing has to
                  be re-typed.
                </p>
              </div>
            </Alert>
          )}

          <Actions>
            <BtnBack href="/shop">← Back to shop</BtnBack>
            <BtnPrint type="button" onClick={() => window.print()}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="3" y="1.5" width="6" height="2.5" stroke="currentColor" strokeWidth="1.2" />
                <rect x="2" y="4" width="8" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                <rect x="3.5" y="7" width="5" height="3.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Print receipt
            </BtnPrint>
          </Actions>
        </Card>
      </Shell>
    </PrintReset>
  );
}

/**
 * Three-step tracker that mirrors the admin fulfillment stages so the
 * customer sees exactly what the operator sees — in real time on next
 * page load, since /order/[ref] is `dynamic = "force-dynamic"` and the
 * fulfillment stage lives on the order record itself.
 */
function FulfillmentTracker({ fulfillment }: { fulfillment: FulfillmentState }) {
  const stageOf = (
    s: "produced" | "packed" | "dispatched",
  ): "done" | "active" | "pending" => {
    const order: FulfillmentState[] = ["none", "produced", "packed", "dispatched"];
    const cur = order.indexOf(fulfillment);
    const idx = order.indexOf(s);
    if (cur > idx) return "done";
    if (cur === idx) return "active";
    return "pending";
  };

  const headline =
    fulfillment === "dispatched"
      ? "Dispatched — on its way"
      : fulfillment === "packed"
      ? "Packed and ready to ship"
      : fulfillment === "produced"
      ? "Produced — moving to packing"
      : "In the production queue";

  const steps: Array<{
    key: "produced" | "packed" | "dispatched";
    label: string;
    sub: string;
  }> = [
    { key: "produced", label: "Produced", sub: "Printed and assembled" },
    { key: "packed", label: "Packed", sub: "Packing slip + box ready" },
    { key: "dispatched", label: "Dispatched", sub: "Handed to the carrier" },
  ];

  return (
    <Track aria-label="Order fulfillment progress">
      <TrackHead>
        <h3>{headline}</h3>
        <TrackHint>
          Deliveries start December 1, 2026 — we ship in paid sequence.
        </TrackHint>
      </TrackHead>
      <Rail>
        {steps.map((s) => {
          const state = stageOf(s.key);
          return (
            <RailStep key={s.key} $state={state}>
              <RailDot $state={state} aria-hidden="true">
                {state === "done" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : state === "active" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="2.4" fill="currentColor" />
                  </svg>
                ) : null}
              </RailDot>
              <RailLabel>{s.label}</RailLabel>
              <RailSub>{s.sub}</RailSub>
            </RailStep>
          );
        })}
      </Rail>
    </Track>
  );
}
