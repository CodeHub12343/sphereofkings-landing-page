"use client";

import styled from "styled-components";
import Link from "next/link";
import { StoredOrder } from "@/lib/db/collections/orders";
import {
  formatRelative,
  PaymentState,
  FulfillmentState,
  OrderOrigin,
} from "@/lib/sample-orders";
import { formatMoney } from "@/lib/products";

export type AdminOrderLine = {
  slug: string;
  name: string;
  qty: number;
  image?: string;
  unitAmount: number | null;
  currency: string;
  lineTotal: number | null;
};

export type AdminAuditRow = {
  id: string;
  whenISO: string;
  summary: string;
  action: string;
  actorEmail: string | null;
};

export default function AdminOrderDetail({
  order,
  lines,
  isDemo,
  sampleRefs,
  audit,
}: {
  order: StoredOrder;
  lines: AdminOrderLine[];
  isDemo: boolean;
  sampleRefs: string[];
  audit: AdminAuditRow[];
}) {
  const hasLines = lines.length > 0;
  const allPriced = hasLines && lines.every((l) => l.unitAmount != null);
  const subtotal = lines.reduce((n, l) => n + (l.lineTotal ?? 0), 0);
  const currency =
    lines.find((l) => l.unitAmount != null)?.currency ?? "USD";
  const totalDisplay = allPriced
    ? formatMoney(subtotal, currency)
    : order.totalDisplay || "$—";
  const isSample = sampleRefs.includes(order.ref) || isDemo;

  return (
    <Shell>
      <Crumbs>
        <Link href="/admin/orders">← All orders</Link>
      </Crumbs>

      <Head>
        <HeadMain>
          <Ref>{order.ref}</Ref>
          <SubRow>
            <When>Placed {formatRelative(order.placedISO)}</When>
            <Dot aria-hidden="true">·</Dot>
            <When>
              {new Date(order.placedISO).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </When>
            {isSample && <SampleTag>Demo row</SampleTag>}
          </SubRow>
          <PillRow>
            <OriginPill origin={order.origin} affiliateCode={order.affiliateCode} />
            <PaymentPill p={order.payment} />
            <FulfillmentPill f={order.fulfillment} />
          </PillRow>
        </HeadMain>
        <HeadRight>
          <TotalLabel>Order total</TotalLabel>
          <TotalVal>{totalDisplay}</TotalVal>
          <ActionRow>
            <GhostLink href={`/order/${order.ref}`} target="_blank" rel="noreferrer">
              Customer view ↗
            </GhostLink>
            <GhostLink href={`/admin/fulfillment?ref=${encodeURIComponent(order.ref)}`}>
              Open fulfillment
            </GhostLink>
          </ActionRow>
        </HeadRight>
      </Head>

      <Grid>
        <MainCol>
          <Card>
            <CardHead>
              <h2>Line items</h2>
              <HeadMeta>
                {order.itemSummary || `${lines.length} item${lines.length === 1 ? "" : "s"}`}
              </HeadMeta>
            </CardHead>
            {hasLines ? (
              <LineTable>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit</th>
                    <th style={{ textAlign: "right" }}>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.slug}>
                      <td>
                        <LineCell>
                          <Thumb>
                            {l.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={l.image} alt="" />
                            ) : (
                              <ThumbStub aria-hidden="true" />
                            )}
                          </Thumb>
                          <div>
                            <LineName>{l.name}</LineName>
                            <LineSlug>{l.slug}</LineSlug>
                          </div>
                        </LineCell>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Mono>{l.qty}</Mono>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Mono $muted={l.unitAmount == null}>
                          {l.unitAmount != null
                            ? formatMoney(l.unitAmount, l.currency)
                            : "$—"}
                        </Mono>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Mono $muted={l.lineTotal == null}>
                          {l.lineTotal != null
                            ? formatMoney(l.lineTotal, l.currency)
                            : "$—"}
                        </Mono>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right" }}>Subtotal</td>
                    <td style={{ textAlign: "right" }}>
                      <Mono $muted={!allPriced}>
                        {allPriced ? formatMoney(subtotal, currency) : "price pending"}
                      </Mono>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right", color: "#a89880" }}>
                      Shipping
                    </td>
                    <td style={{ textAlign: "right", color: "#5a4a38", fontStyle: "italic" }}>
                      calculated at checkout
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right", color: "#a89880" }}>
                      Tax
                    </td>
                    <td style={{ textAlign: "right", color: "#5a4a38", fontStyle: "italic" }}>
                      calculated at checkout
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>
                      Total
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800 }}>
                      <Mono $muted={!allPriced}>{totalDisplay}</Mono>
                    </td>
                  </tr>
                </tfoot>
              </LineTable>
            ) : (
              <Empty>
                No stored line items on this record. Likely a demo row or an
                order placed before per-line checkout persistence shipped.
              </Empty>
            )}
          </Card>

          <Card>
            <CardHead>
              <h2>Ship to</h2>
            </CardHead>
            {order.shipTo ? (
              <Addr>
                <div>{order.shipTo.name}</div>
                <div>{order.shipTo.line1}</div>
                {order.shipTo.line2 && <div>{order.shipTo.line2}</div>}
                <div>
                  {order.shipTo.city} {order.shipTo.postal}
                </div>
                <div>{order.shipTo.country}</div>
              </Addr>
            ) : (
              <Empty>No shipping address on file.</Empty>
            )}
          </Card>

          {order.notes && (
            <Card>
              <CardHead>
                <h2>Notes</h2>
              </CardHead>
              <Notes>{order.notes}</Notes>
            </Card>
          )}
        </MainCol>

        <SideCol>
          <Card>
            <CardHead>
              <h2>Customer</h2>
            </CardHead>
            <KV>
              <dt>Name</dt>
              <dd>{order.customerName}</dd>
              <dt>Email</dt>
              <dd>
                {order.customerEmail ? (
                  <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
                ) : (
                  <Muted>{order.customerEmailMasked}</Muted>
                )}
              </dd>
              {order.customerPhone && (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                  </dd>
                </>
              )}
              <dt>Origin</dt>
              <dd>{originLabel(order.origin)}</dd>
              {order.affiliateCode && (
                <>
                  <dt>Affiliate</dt>
                  <dd>
                    <Mono>{order.affiliateCode}</Mono>
                  </dd>
                </>
              )}
            </KV>
          </Card>

          <Card>
            <CardHead>
              <h2>Payment</h2>
            </CardHead>
            <KV>
              <dt>Status</dt>
              <dd>
                <PaymentPill p={order.payment} />
              </dd>
              <dt>Total</dt>
              <dd>
                <Mono $muted={!allPriced}>{totalDisplay}</Mono>
              </dd>
              {order.totalMinor != null && (
                <>
                  <dt>Captured (minor)</dt>
                  <dd>
                    <Mono>{order.totalMinor.toLocaleString()}</Mono>
                  </dd>
                </>
              )}
              {order.stripePaymentIntentId && (
                <>
                  <dt>Stripe intent</dt>
                  <dd>
                    <Mono>{order.stripePaymentIntentId}</Mono>
                  </dd>
                </>
              )}
            </KV>
          </Card>

          <Card>
            <CardHead>
              <h2>Fulfillment</h2>
            </CardHead>
            <Steps>
              <Step $state={stepState(order.fulfillment, "produced")}>
                <StepDot />
                <StepLabel>Produced</StepLabel>
              </Step>
              <Step $state={stepState(order.fulfillment, "packed")}>
                <StepDot />
                <StepLabel>Packed</StepLabel>
              </Step>
              <Step $state={stepState(order.fulfillment, "dispatched")}>
                <StepDot />
                <StepLabel>Dispatched</StepLabel>
              </Step>
            </Steps>
            <GhostLink
              href={`/admin/fulfillment?ref=${encodeURIComponent(order.ref)}`}
              style={{ marginTop: 10, alignSelf: "flex-start" }}
            >
              Advance in fulfillment →
            </GhostLink>
          </Card>

          <Card>
            <CardHead>
              <h2>Activity</h2>
            </CardHead>
            {audit.length === 0 ? (
              <Empty>Nothing recorded against this order yet.</Empty>
            ) : (
              <Timeline>
                {audit.map((a) => (
                  <TimelineItem key={a.id}>
                    <TLWhen>
                      {new Date(a.whenISO).toLocaleString("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TLWhen>
                    <TLBody>
                      <TLSummary>{a.summary}</TLSummary>
                      <TLMeta>
                        <Mono>{a.action}</Mono>
                        {a.actorEmail && <> · {a.actorEmail}</>}
                      </TLMeta>
                    </TLBody>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </Card>
        </SideCol>
      </Grid>
    </Shell>
  );
}

/* ---------------- Pills + small helpers ---------------- */

function originLabel(o: OrderOrigin): string {
  if (o === "early-bird") return "Early Bird";
  if (o === "kickstarter") return "Kickstarter";
  return "Wholesale";
}

function OriginPill({
  origin,
  affiliateCode,
}: {
  origin: OrderOrigin;
  affiliateCode?: string;
}) {
  const tone: PillTone =
    origin === "early-bird"
      ? "earlybird"
      : origin === "kickstarter"
      ? "kickstarter"
      : "wholesale";
  return (
    <>
      <Pill $tone={tone}>{originLabel(origin)}</Pill>
      {affiliateCode && <AffCode>{affiliateCode}</AffCode>}
    </>
  );
}

function PaymentPill({ p }: { p: PaymentState }) {
  const map: Record<PaymentState, { tone: PillTone; label: string }> = {
    paid: { tone: "paid", label: "Paid" },
    pending: { tone: "pending", label: "Pending" },
    failed: { tone: "failed", label: "Failed" },
    "refund-pending": { tone: "refund-pending", label: "Refund pending" },
    "partially-refunded": { tone: "partial", label: "Partial refund" },
    refunded: { tone: "refunded", label: "Refunded" },
  };
  const { tone, label } = map[p];
  return (
    <Pill $tone={tone}>
      <PillDot aria-hidden="true" />
      {label}
    </Pill>
  );
}

function FulfillmentPill({ f }: { f: FulfillmentState }) {
  if (f === "none") return <Pill $tone="partial">Awaiting production</Pill>;
  if (f === "produced") return <Pill $tone="pending">Produced</Pill>;
  if (f === "packed") return <Pill $tone="pending">Packed</Pill>;
  return <Pill $tone="paid">Dispatched</Pill>;
}

function stepState(
  f: FulfillmentState,
  step: "produced" | "packed" | "dispatched",
): "done" | "active" | "off" {
  const order: FulfillmentState[] = ["none", "produced", "packed", "dispatched"];
  const current = order.indexOf(f);
  const target = order.indexOf(step);
  if (current > target) return "done";
  if (current === target) return "active";
  return "off";
}

/* ---------------- Styled ---------------- */

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Crumbs = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  a {
    color: #a89880;
    text-decoration: none;

    &:hover {
      color: #f0c040;
    }
  }
`;

const Head = styled.header`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  padding: 22px 24px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const HeadMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const Ref = styled.h1`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  color: #f5f0e8;
  font-size: clamp(1.3rem, 2.5vw, 1.7rem);
  margin: 0;
  letter-spacing: 0.02em;
`;

const SubRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const When = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  color: #a89880;
`;

const Dot = styled.span`
  color: #3a3025;
`;

const SampleTag = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  background: rgba(185, 28, 28, 0.14);
  color: #ff6b7a;
  border: 1px solid rgba(255, 107, 122, 0.3);
`;

const PillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const HeadRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;

  @media (max-width: 720px) {
    align-items: flex-start;
  }
`;

const TotalLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
`;

const TotalVal = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f5f0e8;
  font-variant-numeric: tabular-nums;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const GhostLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #a89880;
  text-decoration: none;
  padding: 7px 12px;
  border: 1px solid #2e2618;
  border-radius: 6px;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const SideCol = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1rem;
    margin: 0;
    font-weight: 700;
  }
`;

const HeadMeta = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;
`;

const LineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  thead th {
    text-align: left;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    padding: 10px 8px;
    border-bottom: 1px solid #1e1a12;
  }

  tbody td {
    padding: 12px 8px;
    border-bottom: 1px solid #1e1a12;
    color: #f5f0e8;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tfoot td {
    padding: 10px 8px;
    color: #f5f0e8;
    border-top: 1px solid #1e1a12;
    font-family: "Inter", sans-serif;
    font-size: 0.85rem;
  }

  tfoot tr:first-child td {
    border-top: 1px solid #2e2618;
  }
`;

const LineCell = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Thumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background: #1a1612;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ThumbStub = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1612;
`;

const LineName = styled.div`
  font-weight: 600;
  color: #f5f0e8;
  line-height: 1.25;
`;

const LineSlug = styled.div`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.7rem;
  color: #5a4a38;
`;

const Mono = styled.span<{ $muted?: boolean }>`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$muted ? "#5a4a38" : "inherit")};
`;

const Empty = styled.p`
  margin: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
`;

const Addr = styled.address`
  font-style: normal;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  color: #f5f0e8;
  line-height: 1.55;

  div {
    display: block;
  }
`;

const Notes = styled.p`
  margin: 0;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-wrap;
`;

const KV = styled.dl`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px 14px;
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;

  dt {
    color: #a89880;
    font-weight: 600;
    font-size: 0.78rem;
  }
  dd {
    margin: 0;
    color: #f5f0e8;
    min-width: 0;
    word-break: break-word;
  }
  dd a {
    color: #f5f0e8;
    text-decoration: none;

    &:hover {
      color: #f0c040;
    }
  }
`;

const Muted = styled.span`
  color: #a89880;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Step = styled.div<{ $state: "done" | "active" | "off" }>`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(p) =>
    p.$state === "done"
      ? "#4fb07d"
      : p.$state === "active"
      ? "#f0c040"
      : "#5a4a38"};
`;

const StepDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
`;

const StepLabel = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TimelineItem = styled.li`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  padding: 10px;
  background: #0a0a0a;
  border: 1px solid #1e1a12;
  border-radius: 8px;
`;

const TLWhen = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const TLBody = styled.div`
  min-width: 0;
`;

const TLSummary = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #f5f0e8;
  line-height: 1.4;
`;

const TLMeta = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
  margin-top: 2px;
`;

type PillTone =
  | "earlybird"
  | "kickstarter"
  | "wholesale"
  | "paid"
  | "pending"
  | "failed"
  | "refund-pending"
  | "partial"
  | "refunded";

const toneStyles: Record<PillTone, string> = {
  earlybird: "background: rgba(201,162,39,0.14); color: #f0c040;",
  kickstarter: "background: rgba(76,124,224,0.14); color: #7fa3ff;",
  wholesale:
    "background: #1a1612; color: #f5f0e8; border: 1px solid #2e2618;",
  paid: "background: rgba(79,176,125,0.14); color: #4fb07d;",
  pending: "background: rgba(224,169,74,0.14); color: #e0a94a;",
  failed: "background: rgba(185,28,28,0.14); color: #ff6b7a;",
  "refund-pending": "background: rgba(224,169,74,0.14); color: #e0a94a;",
  partial:
    "background: #1a1612; color: #a89880; border: 1px solid #2e2618;",
  refunded: "background: #1a1612; color: #5a4a38;",
};

const Pill = styled.span<{ $tone: PillTone }>`
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
  text-transform: uppercase;
  white-space: nowrap;
  ${(p) => toneStyles[p.$tone]}
`;

const PillDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const AffCode = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: #a89880;
  background: #1a1612;
  padding: 2px 7px;
  border-radius: 3px;
`;
