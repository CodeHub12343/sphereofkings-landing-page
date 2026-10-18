import AdminOverview, {
  OverviewStats,
} from "@/components/admin/AdminOverview";
import {
  listOrdersWithSamples,
  listStoredOrders,
  StoredOrder,
} from "@/lib/db/collections/orders";
import { listProducts } from "@/lib/db/collections/products";
import { listSubscribers } from "@/lib/store/subscribers-store";
import { listQuotes } from "@/lib/store/quotes-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Overview — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  // Pull in parallel — these all go to different collections/stores and
  // nothing here depends on the output of another call.
  const [all, real, products, subscribers, quotes] = await Promise.all([
    listOrdersWithSamples(),
    listStoredOrders(),
    listProducts(),
    listSubscribers().catch(() => []),
    listQuotes().catch(() => []),
  ]);

  const needsAttention = all.filter(
    (o) =>
      o.payment === "pending" ||
      o.payment === "failed" ||
      o.payment === "refund-pending",
  ).length;
  const dispatched = all.filter((o) => o.fulfillment === "dispatched").length;

  const paidOrders: StoredOrder[] = all.filter((o) => o.payment === "paid");
  const paidWithTotals = paidOrders.filter(
    (o) => typeof o.totalMinor === "number" && (o.totalMinor ?? 0) > 0,
  );
  const revenueMinor = paidWithTotals.reduce(
    (n, o) => n + (o.totalMinor ?? 0),
    0,
  );
  const pendingPriceCount = products.filter((p) => !p.priceApproved).length;

  const openQuotesCount = quotes.filter(
    (q) =>
      q.state === "new" ||
      q.state === "under-review" ||
      q.state === "info-required",
  ).length;

  const consentedSubs =
    typeof subscribers === "object" && Array.isArray(subscribers)
      ? subscribers.filter((s) => s.consented).length
      : 0;

  const recentOrders = all.slice(0, 5).map((o) => ({
    ref: o.ref,
    customerName: o.customerName,
    placedISO: o.placedISO,
    totalDisplay: o.totalDisplay || "$—",
    payment: o.payment,
    origin: o.origin,
  }));

  const stats: OverviewStats = {
    realOrdersCount: real.length,
    totalOrdersCount: all.length,
    needsAttention,
    dispatched,
    paidCount: paidOrders.length,
    revenueMinor,
    revenueCurrency: "USD",
    pendingPriceCount,
    subscribersCount: consentedSubs,
    productsCount: products.length,
    openQuotesCount,
    recentOrders,
  };

  return <AdminOverview stats={stats} />;
}
