import { notFound } from "next/navigation";
import type { Metadata } from "next";
import OrderShell from "@/components/order/OrderShell";
import ClearCartOnMount from "@/components/cart/ClearCartOnMount";
import { findOrderByRef } from "@/lib/db/collections/orders";
import { SAMPLE_ORDERS } from "@/lib/sample-orders";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Static params for the known sample refs so demo links keep working
  // without a database hit. Real orders are server-rendered dynamically.
  return SAMPLE_ORDERS.map((o) => ({ ref: o.ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const order = await findOrderByRef(ref);
  const title = order
    ? `Order ${order.ref} — Sphere of Kings`
    : "Order not found — Sphere of Kings";
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await findOrderByRef(ref);
  if (!order) notFound();

  // Flag the "demo" banner only when this is a sample row — real
  // stored orders have `createdByCheckoutISO` set by the checkout
  // action.
  const isDemo = !("createdByCheckoutISO" in order) || !order.createdByCheckoutISO;
  return (
    <>
      {/* Landing here means a real checkout just completed — wipe
          the buyer's cart so nothing from the previous order persists.
          Demo rows don't need this, but clearing an already-empty cart
          is a no-op so it's safe to always render. */}
      {!isDemo && <ClearCartOnMount />}
      <OrderShell order={order} isDemo={isDemo} />
    </>
  );
}
