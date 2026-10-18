import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Wrap } from "@/components/shared";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";
import { findOrderByRef } from "@/lib/db/collections/orders";
import { listProducts } from "@/lib/db/collections/products";
import { listAuditEvents } from "@/lib/db/collections/audit";
import { SAMPLE_ORDERS } from "@/lib/sample-orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  return {
    title: `Order ${ref} — Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const order = await findOrderByRef(ref);
  if (!order) notFound();

  // Hydrate line items with product data (image, approved price) so the
  // detail view can show a proper line-by-line breakdown. Lines are
  // only present on orders our own checkout created; sample demo rows
  // fall through with just the ref/summary.
  const allProducts = await listProducts();
  const lines = (order.lines ?? []).map((l) => {
    const product = allProducts.find((p) => p.slug === l.slug);
    const unitAmount =
      product?.priceApproved && product.price ? product.price.amount : null;
    return {
      slug: l.slug,
      name: l.name,
      qty: l.qty,
      image: product?.image,
      unitAmount,
      currency: product?.price?.currency ?? "USD",
      lineTotal: unitAmount == null ? null : unitAmount * l.qty,
    };
  });

  const isDemo =
    !("createdByCheckoutISO" in order) || !order.createdByCheckoutISO;

  // Pull audit events that mention this order ref so the right-hand
  // timeline isn't empty on real orders.
  const audit = await listAuditEvents({ limit: 20 }).catch(() => []);
  const relatedAudit = audit.filter(
    (e) =>
      e.target?.id === order.ref ||
      (e.summary ?? "").includes(order.ref) ||
      (e.target?.collection === "orders" && e.target?.id === order.ref),
  );

  return (
    <section style={{ padding: "clamp(20px, 3vw, 36px) 0 clamp(40px, 6vw, 72px)" }}>
      <Wrap>
        <AdminOrderDetail
          order={order}
          lines={lines}
          isDemo={isDemo}
          sampleRefs={SAMPLE_ORDERS.map((o) => o.ref)}
          audit={relatedAudit.map((e) => ({
            id: e.id,
            whenISO: e.timestampISO,
            summary: e.summary,
            action: e.action,
            actorEmail: e.actor?.email ?? null,
          }))}
        />
      </Wrap>
    </section>
  );
}
