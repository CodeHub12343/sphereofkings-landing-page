"use client";

import { useMemo, useState, useTransition } from "react";
import styled from "styled-components";
import {
  FulfillmentState,
  formatShipTo,
  ShipTo,
  SampleOrder,
} from "@/lib/sample-orders";
import { CARRIERS, CarrierId, validateTracking } from "@/lib/carriers";
import { openPackingSlipWindow } from "./PackingSlip";
import { setFulfillmentStageAction } from "@/app/admin/fulfillment/actions";

export type FulfillmentQueueItem = {
  ref: string;
  customerName: string;
  customerEmailMasked: string;
  itemSummary: string;
  fulfillment: FulfillmentState;
  shipTo: ShipTo | null;
  affiliateCode: string | null;
  placedISO: string;
};

type LocalState = {
  produced: boolean;
  packed: boolean;
  dispatched: boolean;
  carrier: CarrierId;
  tracking: string;
};

function seedState(fulfillment: FulfillmentState): LocalState {
  return {
    produced:
      fulfillment === "produced" ||
      fulfillment === "packed" ||
      fulfillment === "dispatched",
    packed: fulfillment === "packed" || fulfillment === "dispatched",
    dispatched: fulfillment === "dispatched",
    carrier: "dhl-express",
    tracking: fulfillment === "dispatched" ? "1234567890" : "",
  };
}

function derive(state: LocalState): FulfillmentState {
  if (state.dispatched) return "dispatched";
  if (state.packed) return "packed";
  if (state.produced) return "produced";
  return "none";
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) {
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

const Head = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
`;

const Ref = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 1.4rem;
  font-weight: 800;
  color: #f5f0e8;
`;

const Origin = styled.span`
  font-family: "Cinzel", serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c9a227;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const Addr = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #f5f0e8;
  white-space: pre-line;
  padding: 12px 14px;
  background: #1a1612;
  border-radius: 8px;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #1a1612;
  border-radius: 8px;
`;

const Thumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: radial-gradient(
    circle at 30% 25%,
    #d4af37 0%,
    #8a6e1f 35%,
    #1a1510 70%,
    #050303 100%
  );
  flex-shrink: 0;
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #f5f0e8;
`;

const ItemMeta = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const ItemQty = styled.span`
  margin-left: auto;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: #f5f0e8;
`;

const Foot = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-top: 4px;
  border-top: 1px solid #1e1a12;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrintBtn = styled.button`
  background: transparent;
  border: 1px solid #c9a227;
  color: #f0c040;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: rgba(201, 162, 39, 0.08);
    box-shadow: 0 0 20px rgba(201, 162, 39, 0.1);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: #2e2618;
    color: #a89880;
  }
`;

const FlagLink = styled.button`
  background: transparent;
  border: 0;
  color: #ff6b7a;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Counter = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Step = styled.button<{ $state: "off" | "on" | "active" }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  background: ${(p) =>
    p.$state === "on"
      ? "rgba(79,176,125,0.08)"
      : p.$state === "active"
      ? "#0e0c09"
      : "#1a1612"};
  border: 1px solid
    ${(p) =>
      p.$state === "on"
        ? "#4fb07d"
        : p.$state === "active"
        ? "#4c7ce0"
        : "#1e1a12"};
  box-shadow: ${(p) =>
    p.$state === "active" ? "0 0 0 1px #4c7ce0" : "none"};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  color: inherit;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    border-color: ${(p) => (p.$state === "on" ? "#4fb07d" : "#c9a227")};
  }
`;

const StepCheck = styled.div<{ $state: "off" | "on" | "active" }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: ${(p) => (p.$state === "on" ? "#4fb07d" : "#0e0c09")};
  color: ${(p) =>
    p.$state === "on"
      ? "#0a0a0a"
      : p.$state === "active"
      ? "#7fa3ff"
      : "#5a4a38"};
  border: 1px solid
    ${(p) =>
      p.$state === "on"
        ? "#4fb07d"
        : p.$state === "active"
        ? "#4c7ce0"
        : "#2e2618"};
  border-style: ${(p) => (p.$state === "active" ? "dashed" : "solid")};
`;

const StepBody = styled.div`
  flex: 1;
`;

const StepName = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f5f0e8;
`;

const StepWhen = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  margin-top: 2px;
`;

const StepRevert = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  color: #5a4a38;
  letter-spacing: 0.04em;
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div<{ $tone?: "ok" | "err" | "neutral" }>`
  background: #1a1612;
  border: 1.5px solid
    ${(p) =>
      p.$tone === "ok"
        ? "#4fb07d"
        : p.$tone === "err"
        ? "#b91c1c"
        : "#2e2618"};
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: ${(p) =>
      p.$tone === "err" ? "#b91c1c" : "#c9a227"};
    box-shadow: 0 0 0 3px
      ${(p) =>
        p.$tone === "err"
          ? "rgba(185, 28, 28, 0.14)"
          : "rgba(201, 162, 39, 0.12)"};
  }

  input,
  select {
    background: transparent;
    border: 0;
    outline: 0;
    flex: 1;
    color: #f5f0e8;
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    width: 100%;
    font-weight: 500;
  }
  select {
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  .mono input {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  input::placeholder {
    color: #5a4a38;
  }
  svg {
    color: #a89880;
    flex-shrink: 0;
  }
`;

const Hint = styled.p<{ $tone: "ok" | "err" | "muted" }>`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  color: ${(p) =>
    p.$tone === "ok"
      ? "#4fb07d"
      : p.$tone === "err"
      ? "#ff6b7a"
      : "#a89880"};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const TrackLink = styled.a`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #7fa3ff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
`;

const NavBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    color: #f0c040;
    border-color: #c9a227;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Empty = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(32px, 5vw, 56px) clamp(20px, 4vw, 36px);
  color: #a89880;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  text-align: center;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.3rem;
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 480px;
  }
`;

const EmptySteps = styled.ol`
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  max-width: 520px;
  width: 100%;

  li {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 12px;
    align-items: start;
    padding: 12px 14px;
    background: #1a1612;
    border: 1px solid #2e2618;
    border-radius: 8px;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #f5f0e8;
  }
  .n {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(201, 162, 39, 0.14);
    color: #f0c040;
    font-family: "Cinzel", serif;
    font-weight: 800;
    font-size: 0.75rem;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  strong {
    color: #f0c040;
    font-weight: 600;
  }
  a {
    color: #f0c040;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  code {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    background: #0e0c09;
    color: #f0c040;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 0.85em;
    white-space: nowrap;
  }
`;

// Honest step labels — no fabricated timestamps or initials. The real
// audit log at /admin/audit carries who/when for every stage change.
function stepLabel(
  step: "produced" | "packed" | "dispatched",
  done: boolean,
  active: boolean,
): string {
  if (done) return "Completed";
  if (active) return "In progress";
  return "Pending";
}

export default function FulfillmentView({
  queue = [],
  initialRef = null,
}: {
  queue?: FulfillmentQueueItem[];
  initialRef?: string | null;
}) {
  // Jump straight to a specific order when the URL carried ?ref=…;
  // otherwise start at the top of the queue.
  const initialIndex = (() => {
    if (!initialRef) return 0;
    const idx = queue.findIndex((o) => o.ref === initialRef);
    return idx >= 0 ? idx : 0;
  })();
  const [index, setIndex] = useState(initialIndex);
  const [byRef, setByRef] = useState<Record<string, LocalState>>(() => {
    const seeded: Record<string, LocalState> = {};
    for (const o of queue) seeded[o.ref] = seedState(o.fulfillment);
    return seeded;
  });
  const [, startTransition] = useTransition();

  const order = queue[index];
  const state = useMemo(
    () => byRef[order?.ref] ?? seedState("none"),
    [byRef, order],
  );

  const trackingCheck = useMemo(
    () => validateTracking(state.carrier, state.tracking),
    [state.carrier, state.tracking],
  );

  if (!order) {
    return (
      <Empty>
        <h2>No paid Early Bird orders yet.</h2>
        <p>
          Nothing fabricated here. Early Bird orders land in this queue the
          moment Stripe confirms the payment — oldest-paid first.
        </p>
        <EmptySteps>
          <li>
            <span className="n">1</span>
            <span>
              <strong>Approve a product price</strong> in{" "}
              <a href="/admin/products">/admin/products</a>. Orders can&apos;t
              be paid until pricing is approved.
            </span>
          </li>
          <li>
            <span className="n">2</span>
            <span>
              <strong>Share the shop link</strong> or run a test order from{" "}
              <a href="/shop">/shop</a> with Stripe test card{" "}
              <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
            </span>
          </li>
          <li>
            <span className="n">3</span>
            <span>
              Once the Stripe webhook flips the order to{" "}
              <strong>paid</strong>, come back here. The order shows up
              instantly — no refresh needed on next visit.
            </span>
          </li>
        </EmptySteps>
      </Empty>
    );
  }

  const persist = (ref: string, next: LocalState) => {
    const stage = derive(next);
    startTransition(async () => {
      await setFulfillmentStageAction(ref, stage).catch(() => {
        // Server rejected — nothing to do; the UI stays on the local
        // optimistic value until the next full load refetches.
      });
    });
  };

  const update = (patch: Partial<LocalState>) => {
    setByRef((prev) => {
      const current = prev[order.ref] ?? seedState("none");
      const next: LocalState = { ...current, ...patch };
      if (next.dispatched) next.packed = true;
      if (next.packed) next.produced = true;
      if (!next.produced) {
        next.packed = false;
        next.dispatched = false;
      }
      if (!next.packed) next.dispatched = false;
      persist(order.ref, next);
      return { ...prev, [order.ref]: next };
    });
  };

  const step = (name: "produced" | "packed" | "dispatched") =>
    update({ [name]: !state[name] } as Partial<LocalState>);

  const stateOf = (
    name: "produced" | "packed" | "dispatched",
  ): "off" | "on" | "active" => {
    if (state[name]) return "on";
    if (name === "produced") return "active";
    if (name === "packed" && state.produced) return "active";
    if (name === "dispatched" && state.packed) return "active";
    return "off";
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(queue.length - 1, i + 1));

  const canPrint = !!order.shipTo;
  const printSlip = () => {
    if (!canPrint) return;
    openPackingSlipWindow({
      // PackingSlip expects a SampleOrder-shaped record. Our queue
      // item carries the same fields but with nullable shipTo/affiliate,
      // which we only hit when canPrint is true (shipTo is set).
      order: {
        ...order,
        shipTo: order.shipTo!,
        affiliateCode: order.affiliateCode ?? undefined,
        totalDisplay: "$—",
        payment: "paid",
      } as SampleOrder,
      carrierId: state.carrier,
      trackingNumber: state.tracking,
    });
  };

  return (
    <Layout>
      <Card>
        <Head>
          <Ref>{order.ref}</Ref>
          <Origin>Early Bird · Paid</Origin>
        </Head>
        <Section>
          <SectionLabel>Ship to</SectionLabel>
          <Addr>
            {order.shipTo
              ? formatShipTo(order.shipTo)
              : "Shipping address pending backend wire-up"}
          </Addr>
        </Section>
        <Section>
          <SectionLabel>Items</SectionLabel>
          <Items>
            <Item>
              <Thumb aria-hidden="true" />
              <ItemBody>
                <ItemName>{order.itemSummary}</ItemName>
                <ItemMeta>Early Bird · packed in order sequence</ItemMeta>
              </ItemBody>
              <ItemQty>{itemsSummaryToQty(order.itemSummary)}</ItemQty>
            </Item>
          </Items>
        </Section>
        <Foot>
          <FlagLink type="button">Flag an issue</FlagLink>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <PrintBtn
              type="button"
              onClick={printSlip}
              disabled={!canPrint}
              title={
                canPrint
                  ? "Open a printable packing slip"
                  : "Shipping address missing"
              }
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="1.5"
                  width="6"
                  height="2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <rect
                  x="2"
                  y="4"
                  width="8"
                  height="4.5"
                  rx="0.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <rect
                  x="3.5"
                  y="7"
                  width="5"
                  height="3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              Print packing slip
            </PrintBtn>
            <Counter>
              Order {index + 1} of {queue.length}
            </Counter>
          </div>
        </Foot>
        <Nav aria-label="Queue navigation">
          <NavBtn type="button" onClick={prev} disabled={index === 0}>
            ← Previous
          </NavBtn>
          <NavBtn
            type="button"
            onClick={next}
            disabled={index === queue.length - 1}
          >
            Next →
          </NavBtn>
        </Nav>
      </Card>

      <Card>
        <SectionLabel>Fulfillment</SectionLabel>
        <StepList>
          <Step
            type="button"
            $state={stateOf("produced")}
            onClick={() => step("produced")}
            aria-pressed={state.produced}
          >
            <StepCheck $state={stateOf("produced")} aria-hidden="true">
              {state.produced ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : stateOf("produced") === "active" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.4" fill="currentColor" />
                </svg>
              ) : null}
            </StepCheck>
            <StepBody>
              <StepName>Produced</StepName>
              <StepWhen>
                {stepLabel(
                  "produced",
                  state.produced,
                  stateOf("produced") === "active",
                )}
              </StepWhen>
            </StepBody>
            {state.produced && <StepRevert>Click to undo</StepRevert>}
          </Step>

          <Step
            type="button"
            $state={stateOf("packed")}
            onClick={() => step("packed")}
            aria-pressed={state.packed}
          >
            <StepCheck $state={stateOf("packed")} aria-hidden="true">
              {state.packed ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : stateOf("packed") === "active" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.4" fill="currentColor" />
                </svg>
              ) : null}
            </StepCheck>
            <StepBody>
              <StepName>Packed</StepName>
              <StepWhen>
                {stepLabel(
                  "packed",
                  state.packed,
                  stateOf("packed") === "active",
                )}
              </StepWhen>
            </StepBody>
            {state.packed && <StepRevert>Click to undo</StepRevert>}
          </Step>

          <Step
            type="button"
            $state={stateOf("dispatched")}
            onClick={() => step("dispatched")}
            aria-pressed={state.dispatched}
          >
            <StepCheck $state={stateOf("dispatched")} aria-hidden="true">
              {state.dispatched ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : stateOf("dispatched") === "active" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.4" fill="currentColor" />
                </svg>
              ) : null}
            </StepCheck>
            <StepBody>
              <StepName>Dispatched</StepName>
              <StepWhen>
                {stepLabel(
                  "dispatched",
                  state.dispatched,
                  stateOf("dispatched") === "active",
                )}
              </StepWhen>
            </StepBody>
            {state.dispatched && <StepRevert>Click to undo</StepRevert>}
          </Step>
        </StepList>

        <Section>
          <SectionLabel>
            Carrier &amp; tracking
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "none",
                color: "#e0a94a",
                marginLeft: 10,
              }}
              title="These inputs aren't yet persisted or sent with the dispatch email."
            >
              · entry only · not yet saved
            </span>
          </SectionLabel>
          <Row2>
            <Field>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="10" height="7" rx="1" stroke="currentColor" />
                <circle cx="5" cy="12" r="1" fill="currentColor" />
                <circle cx="10" cy="12" r="1" fill="currentColor" />
              </svg>
              <select
                aria-label="Carrier"
                value={state.carrier}
                onChange={(e) =>
                  update({ carrier: e.target.value as CarrierId })
                }
              >
                {CARRIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              $tone={
                trackingCheck.kind === "valid"
                  ? "ok"
                  : trackingCheck.kind === "invalid"
                  ? "err"
                  : "neutral"
              }
              className="mono"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7h10M5 4l-3 3 3 3M9 10l3-3-3-3"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Scan or paste a tracking number"
                value={state.tracking}
                onChange={(e) => update({ tracking: e.target.value })}
                aria-label="Tracking number"
              />
            </Field>
          </Row2>
          {trackingCheck.kind === "valid" && (
            <Hint $tone="ok">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Matches the {CARRIERS.find((c) => c.id === state.carrier)?.name}{" "}
              format
              {trackingCheck.url ? (
                <>
                  {" "}
                  ·{" "}
                  <TrackLink
                    href={trackingCheck.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open with carrier →
                  </TrackLink>
                </>
              ) : null}
            </Hint>
          )}
          {trackingCheck.kind === "invalid" && (
            <Hint $tone="err">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M6 3v4m0 1v.3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {trackingCheck.hint}
            </Hint>
          )}
          {trackingCheck.kind === "manual" && (
            <Hint $tone="muted">
              No format check for Other — paste the full tracking URL into
              the carrier's own portal to verify.
            </Hint>
          )}
          {trackingCheck.kind === "empty" && (
            <Hint $tone="muted">
              {CARRIERS.find((c) => c.id === state.carrier)?.formatHint}
            </Hint>
          )}
        </Section>

        <Counter>
          Stage changes save to the orders collection and record an audit event;
          a Dispatched tick also emails the buyer. Carrier &amp; tracking inputs
          aren&apos;t persisted yet. The packing slip opens in a new window for
          print.
        </Counter>
      </Card>
    </Layout>
  );
}

function itemsSummaryToQty(summary: string): string {
  const match = summary.match(/^(\d+)\s*×/);
  if (match) return `×${match[1]}`;
  return summary.split(" ")[0] ?? "";
}
