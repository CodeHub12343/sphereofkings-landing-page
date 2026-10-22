import { Wrap } from "@/components/shared";
import FulfillmentView from "@/components/admin/FulfillmentView";
import { listOrdersWithSamples } from "@/lib/db/collections/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fulfillment · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ ref?: string }>;

export default async function AdminFulfillmentPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};
  const requestedRef = sp.ref?.trim() || null;
  // Fulfillment queue is every paid Early Bird order the store knows
  // about, oldest paid first so the operator works in the sequence
  // customers settled. Non-Early-Bird channels (wholesale, Kickstarter)
  // have their own flows and are intentionally excluded here.
  const all = await listOrdersWithSamples();
  const queue = all
    .filter((o) => o.origin === "early-bird" && o.payment === "paid")
    .sort((a, b) => (a.placedISO < b.placedISO ? -1 : 1))
    .map((o) => ({
      ref: o.ref,
      customerName: o.customerName,
      customerEmailMasked: o.customerEmailMasked,
      itemSummary: o.itemSummary,
      fulfillment: o.fulfillment,
      shipTo: o.shipTo ?? null,
      affiliateCode: o.affiliateCode ?? null,
      placedISO: o.placedISO,
    }));

  // Did the request ask for a specific order? Figure out whether it's
  // already in the Early-Bird-paid queue so we can either jump to it or
  // explain why it isn't visible.
  const inQueue = requestedRef
    ? queue.some((o) => o.ref === requestedRef)
    : false;
  const requestedOrder = requestedRef
    ? all.find((o) => o.ref === requestedRef)
    : undefined;
  const requestedButNotPaid =
    requestedRef && requestedOrder && !inQueue
      ? {
          ref: requestedOrder.ref,
          payment: requestedOrder.payment,
          origin: requestedOrder.origin,
        }
      : null;

  return (
    <section style={pageStyle}>
      <Wrap>
        <header style={{ marginBottom: 20 }}>
          <h1 style={h1Style}>Fulfillment</h1>
          <p style={pStyle}>
            Paid Early Bird orders, oldest first. Tick Produced → Packed →
            Dispatched; each change writes to the orders collection and
            records an audit event.
          </p>
        </header>
        {requestedButNotPaid && (
          <div style={noticeStyle} role="note">
            <strong style={{ color: "#f5f0e8" }}>{requestedButNotPaid.ref}</strong>{" "}
            isn't in the fulfillment queue — it's{" "}
            <code style={codeStyle}>{requestedButNotPaid.payment}</code>
            {requestedButNotPaid.origin !== "early-bird" && (
              <>
                {" "}and its origin is{" "}
                <code style={codeStyle}>{requestedButNotPaid.origin}</code>
              </>
            )}
            . Only paid Early Bird orders appear here.
          </div>
        )}
        {requestedRef && !requestedOrder && (
          <div style={noticeStyle} role="note">
            Order <strong style={{ color: "#f5f0e8" }}>{requestedRef}</strong>{" "}
            was not found.
          </div>
        )}
        <FulfillmentView
          queue={queue}
          initialRef={inQueue ? requestedRef : null}
        />
      </Wrap>
    </section>
  );
}

const noticeStyle: React.CSSProperties = {
  background: "rgba(224, 169, 74, 0.08)",
  border: "1px solid #e0a94a",
  borderRadius: 8,
  padding: "10px 14px",
  marginBottom: 16,
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem",
  color: "#e0a94a",
  lineHeight: 1.5,
};

const codeStyle: React.CSSProperties = {
  fontFamily: "'SFMono-Regular', Menlo, Consolas, monospace",
  background: "#1a1612",
  color: "#f0c040",
  padding: "1px 7px",
  borderRadius: 3,
  fontSize: "0.86em",
};

const pageStyle: React.CSSProperties = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};

const h1Style: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  color: "#f5f0e8",
  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
  margin: "0 0 6px",
  fontWeight: 800,
};

const pStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  color: "#a89880",
  fontSize: "0.92rem",
  margin: 0,
  lineHeight: 1.55,
  maxWidth: 640,
};
