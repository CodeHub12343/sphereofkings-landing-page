import { notFound } from "next/navigation";
import type { Metadata } from "next";
import OrderShell from "@/components/order/OrderShell";
import { SAMPLE_ORDERS } from "@/lib/sample-orders";

export function generateStaticParams() {
  return SAMPLE_ORDERS.map((o) => ({ ref: o.ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const order = SAMPLE_ORDERS.find((o) => o.ref === ref);
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
  const order = SAMPLE_ORDERS.find((o) => o.ref === ref);
  if (!order) notFound();

  // The route reads from sample data today. The real build will swap this
  // for a server-side order lookup once orders persist.
  return <OrderShell order={order} isDemo />;
}
