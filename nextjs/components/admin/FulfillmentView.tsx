"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { SAMPLE_ORDERS, FulfillmentState } from "@/lib/sample-orders";

type LocalState = {
  produced: boolean;
  packed: boolean;
  dispatched: boolean;
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
    tracking:
      fulfillment === "dispatched" ? "DHL 1Z999AA10123456784" : "",
  };
}

// Benjamin's queue — paid Early Bird orders only. Everything else is out of
// his scope. Wholesale and Kickstarter fulfillment have their own flows.
const QUEUE = SAMPLE_ORDERS.filter(
  (o) => o.origin === "early-bird" && o.payment === "paid",
);

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
    border-color: ${(p) =>
      p.$state === "on" ? "#4fb07d" : "#c9a227"};
  }
`;

const StepCheck = styled.div<{ $state: "off" | "on" | "active" }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: ${(p) =>
    p.$state === "on" ? "#4fb07d" : "#0e0c09"};
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

const TrackField = styled.div`
  background: #1a1612;
  border: 1.5px solid #2e2618;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
  }

  input {
    background: transparent;
    border: 0;
    outline: 0;
    flex: 1;
    color: #f5f0e8;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  input::placeholder {
    color: #5a4a38;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    letter-spacing: normal;
  }

  .saved {
    color: #4fb07d;
    font-family: "Inter", sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
  padding: 56px 24px;
  text-align: center;
  color: #a89880;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.3rem;
    margin: 0;
  }
  p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.55;
    max-width: 420px;
  }
`;

function fakeTimestamp(step: "produced" | "packed" | "dispatched") {
  if (step === "produced") return "Today · 09:14 · BO";
  if (step === "packed") return "In progress";
  return "Pending";
}

export default function FulfillmentView() {
  const [index, setIndex] = useState(0);
  // One map keyed by order ref holds local state for each order visited this
  // session. In production this would come from the server with persistence.
  const [byRef, setByRef] = useState<Record<string, LocalState>>(() => {
    const seeded: Record<string, LocalState> = {};
    for (const o of QUEUE) seeded[o.ref] = seedState(o.fulfillment);
    return seeded;
  });
  const [trackingSaved, setTrackingSaved] = useState(false);

  const order = QUEUE[index];

  const state = useMemo(() => byRef[order?.ref] ?? seedState("none"), [byRef, order]);

  if (!order) {
    return (
      <Empty>
        <h2>No paid Early Bird orders.</h2>
        <p>
          Your queue is empty — once Early Bird customers pay through Stripe,
          their orders will land here in the sequence they settled.
        </p>
      </Empty>
    );
  }

  const update = (patch: Partial<LocalState>) => {
    setByRef((prev) => {
      const current = prev[order.ref] ?? seedState("none");
      const next: LocalState = { ...current, ...patch };
      // Enforce sticky order: packed requires produced, dispatched requires packed.
      if (next.dispatched) next.packed = true;
      if (next.packed) next.produced = true;
      // And the reverse — un-ticking an earlier step clears the later ones.
      if (!next.produced) {
        next.packed = false;
        next.dispatched = false;
      }
      if (!next.packed) next.dispatched = false;
      return { ...prev, [order.ref]: next };
    });
  };

  const step = (name: "produced" | "packed" | "dispatched") =>
    update({ [name]: !state[name] } as Partial<LocalState>);

  const stateOf = (
    name: "produced" | "packed" | "dispatched",
  ): "off" | "on" | "active" => {
    if (state[name]) return "on";
    // The first unchecked step after the last checked one is "active".
    if (name === "produced") return "active";
    if (name === "packed" && state.produced) return "active";
    if (name === "dispatched" && state.packed) return "active";
    return "off";
  };

  const prev = () => {
    setIndex((i) => Math.max(0, i - 1));
    setTrackingSaved(false);
  };
  const next = () => {
    setIndex((i) => Math.min(QUEUE.length - 1, i + 1));
    setTrackingSaved(false);
  };

  const onTrackBlur = () => {
    if (state.tracking.trim().length > 0) setTrackingSaved(true);
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
          <Addr>{sampleShipAddress(order.customerName)}</Addr>
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
          <Counter>
            Order {index + 1} of {QUEUE.length} in your queue
          </Counter>
        </Foot>
        <Nav aria-label="Queue navigation">
          <NavBtn type="button" onClick={prev} disabled={index === 0}>
            ← Previous
          </NavBtn>
          <NavBtn type="button" onClick={next} disabled={index === QUEUE.length - 1}>
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
                {state.produced ? fakeTimestamp("produced") : "Pending"}
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
                {state.packed
                  ? fakeTimestamp("packed")
                  : stateOf("packed") === "active"
                  ? "In progress"
                  : "Pending"}
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
                {state.dispatched ? fakeTimestamp("dispatched") : "Pending"}
              </StepWhen>
            </StepBody>
            {state.dispatched && <StepRevert>Click to undo</StepRevert>}
          </Step>
        </StepList>

        <Section>
          <SectionLabel>Tracking number</SectionLabel>
          <TrackField>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{ color: "#a89880" }}
            >
              <rect x="2" y="4" width="10" height="7" rx="1" stroke="currentColor" />
              <path
                d="M4 4V2.5M10 4V2.5M2 7h10"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Scan or paste a tracking number"
              value={state.tracking}
              onChange={(e) => {
                update({ tracking: e.target.value });
                setTrackingSaved(false);
              }}
              onBlur={onTrackBlur}
              aria-label="Tracking number"
            />
            {trackingSaved && state.tracking.trim() && (
              <span className="saved">Saved</span>
            )}
          </TrackField>
          <Counter>
            Local state only — this value is not persisted until the backend
            is wired.
          </Counter>
        </Section>
      </Card>
    </Layout>
  );
}

// Fabricated-looking addresses are kept out — this returns a short
// placeholder keyed to the sample name. Replace with real order shipping
// data once orders persist.
function sampleShipAddress(name: string): string {
  return `${name}
Shipping address pending backend wire-up
—
—`;
}

function itemsSummaryToQty(summary: string): string {
  // "2 × Royal Triple" → "×2"
  const match = summary.match(/^(\d+)\s*×/);
  if (match) return `×${match[1]}`;
  return summary.split(" ")[0] ?? "";
}
