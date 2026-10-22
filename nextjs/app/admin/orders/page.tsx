import { Wrap } from "@/components/shared";
import OrderQueue from "@/components/admin/OrderQueue";
import {
  listOrdersWithSamples,
  listStoredOrders,
} from "@/lib/db/collections/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, real] = await Promise.all([
    listOrdersWithSamples(),
    listStoredOrders().catch(() => []),
  ]);
  return (
    <section style={pageStyle}>
      <Wrap>
        <header style={headStyle}>
          <h1 style={h1Style}>Orders</h1>
          <p style={pStyle}>
            Real pending orders from checkout and the Kickstarter / wholesale
            demo set, merged. Filter by origin or by orders that need
            attention (pending, failed, refund-pending).
          </p>
        </header>
        <OrderQueue orders={orders} />
      </Wrap>
    </section>
  );
}

const pageStyle = {
  padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)",
};
const headStyle = { marginBottom: 20 };
const h1Style = {
  fontFamily: "'Cinzel', serif",
  color: "#f5f0e8",
  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
  margin: "0 0 6px",
  fontWeight: 800 as const,
};
const pStyle = {
  fontFamily: "'Inter', sans-serif",
  color: "#a89880",
  fontSize: "0.92rem",
  margin: 0,
  lineHeight: 1.55,
};
