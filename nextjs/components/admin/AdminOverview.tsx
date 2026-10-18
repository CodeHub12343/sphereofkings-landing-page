"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import { formatMoney } from "@/lib/products";

export type OverviewStats = {
  realOrdersCount: number;
  totalOrdersCount: number;
  needsAttention: number;
  dispatched: number;
  paidCount: number;
  revenueMinor: number;
  revenueCurrency: string;
  pendingPriceCount: number;
  subscribersCount: number;
  productsCount: number;
  openQuotesCount: number;
  recentOrders: Array<{
    ref: string;
    customerName: string;
    placedISO: string;
    totalDisplay: string;
    payment: string;
    origin: string;
  }>;
};

const Page = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px);
`;

const Head = styled.header`
  margin-bottom: 24px;

  h1 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    margin: 0 0 6px;
    font-weight: 800;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.92rem;
    margin: 0;
    line-height: 1.55;
  }
`;

const KPIs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Kpi = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 16px 18px;
`;

const KpiK = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a89880;
`;

const KpiV = styled.div<{ $tone?: "warn" | "muted" | "good" }>`
  font-family: "Inter", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${(p) =>
    p.$tone === "warn"
      ? "#e0a94a"
      : p.$tone === "muted"
      ? "#5a4a38"
      : p.$tone === "good"
      ? "#4fb07d"
      : "#f5f0e8"};
  margin: 8px 0 2px;
  font-variant-numeric: tabular-nums;
`;

const KpiD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 18px 20px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
  }
  header h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1rem;
    margin: 0;
    font-weight: 700;
  }
  header a {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.8rem;
    text-decoration: none;

    &:hover {
      color: #f0c040;
    }
  }
`;

const RecentTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;

  thead th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    padding: 10px 8px;
    border-bottom: 1px solid #1e1a12;
  }

  tbody td {
    padding: 11px 8px;
    border-bottom: 1px solid #1e1a12;
    color: #f5f0e8;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  tbody tr a {
    color: #f5f0e8;
    text-decoration: none;

    &:hover {
      color: #f0c040;
    }
  }

  /* Hand off to the stacked card list on phones. */
  @media (max-width: 720px) {
    display: none;
  }
`;

/* ---- Mobile stacked recent-order cards ---- */

const RecentCardList = styled.ul`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const RecentCard = styled.li`
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecentTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const RecentRefLink = styled(Link)`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: #f5f0e8;
  text-decoration: none;

  &:hover {
    color: #f0c040;
  }
`;

const RecentCust = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  color: #f5f0e8;
  font-weight: 600;
  line-height: 1.3;
`;

const RecentFoot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #2e2618;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  color: #a89880;

  .total {
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    font-size: 0.95rem;
    color: #f5f0e8;
  }
`;

const PaymentTag = styled.span<{ $tone: string }>`
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  background: ${(p) =>
    p.$tone === "paid"
      ? "rgba(79,176,125,0.14)"
      : p.$tone === "failed" || p.$tone === "refund-pending"
      ? "rgba(224,169,74,0.14)"
      : p.$tone === "pending"
      ? "rgba(224,169,74,0.14)"
      : "#1a1612"};
  color: ${(p) =>
    p.$tone === "paid"
      ? "#4fb07d"
      : p.$tone === "pending" || p.$tone === "refund-pending"
      ? "#e0a94a"
      : p.$tone === "failed"
      ? "#ff6b7a"
      : "#a89880"};
`;

const Mono = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
`;

const Empty = styled.p`
  margin: 0;
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  line-height: 1.55;
`;

const QuickLinks = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const QuickLink = styled(Link)`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
  padding: 18px 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #c9a227;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  h3 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1rem;
    margin: 0;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.82rem;
    line-height: 1.5;
    margin: 0;
  }
  span.go {
    font-family: "Inter", sans-serif;
    color: #f0c040;
    font-weight: 700;
    font-size: 0.78rem;
    margin-top: 6px;
  }
`;

export default function AdminOverview({ stats }: { stats: OverviewStats }) {
  const revenueDisplay =
    stats.revenueMinor > 0
      ? formatMoney(stats.revenueMinor / 100, stats.revenueCurrency)
      : null;

  return (
    <Page>
      <Wrap>
        {stats.realOrdersCount === 0 && <DemoBanner />}
        <Head>
          <h1>Overview</h1>
          <p>
            Live figures from the <Mono>orders</Mono>, <Mono>products</Mono>,{" "}
            <Mono>quotes</Mono>, <Mono>subscribers</Mono> and{" "}
            <Mono>auditEvents</Mono> collections.
          </p>
        </Head>

        <KPIs aria-label="Headline figures">
          <Kpi>
            <KpiK>Orders · all time</KpiK>
            <KpiV>{stats.totalOrdersCount}</KpiV>
            <KpiD>
              {stats.realOrdersCount} real · {stats.totalOrdersCount - stats.realOrdersCount} demo
            </KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Needs attention</KpiK>
            <KpiV $tone={stats.needsAttention > 0 ? "warn" : undefined}>
              {stats.needsAttention}
            </KpiV>
            <KpiD>Pending · failed · refund-pending</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Dispatched</KpiK>
            <KpiV $tone="good">{stats.dispatched}</KpiV>
            <KpiD>Across every order in the queue</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Revenue · paid</KpiK>
            {revenueDisplay ? (
              <KpiV>{revenueDisplay}</KpiV>
            ) : (
              <KpiV $tone="muted" style={{ fontSize: "1.1rem" }}>
                {stats.pendingPriceCount > 0
                  ? "pending prices"
                  : "no paid orders yet"}
              </KpiV>
            )}
            <KpiD>
              {stats.paidCount} paid order{stats.paidCount === 1 ? "" : "s"}
              {stats.pendingPriceCount > 0 &&
                ` · ${stats.pendingPriceCount} line${
                  stats.pendingPriceCount === 1 ? "" : "s"
                } waiting on price`}
            </KpiD>
          </Kpi>
        </KPIs>

        <KPIs>
          <Kpi>
            <KpiK>Products</KpiK>
            <KpiV>{stats.productsCount}</KpiV>
            <KpiD>Live SKUs in the catalog</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Subscribers</KpiK>
            <KpiV>{stats.subscribersCount}</KpiV>
            <KpiD>Opted-in to launch mail</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Open quotes</KpiK>
            <KpiV $tone={stats.openQuotesCount > 0 ? "warn" : undefined}>
              {stats.openQuotesCount}
            </KpiV>
            <KpiD>Wholesale queue awaiting a decision</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Attribution</KpiK>
            <KpiV>{stats.needsAttention + stats.openQuotesCount}</KpiV>
            <KpiD>All items waiting on an admin action</KpiD>
          </Kpi>
        </KPIs>

        <SectionGrid>
          <Card>
            <header>
              <h2>Recent orders</h2>
              <Link href="/admin/orders">View all →</Link>
            </header>
            {stats.recentOrders.length === 0 ? (
              <Empty>No orders yet. First checkout will land here.</Empty>
            ) : (
              <>
                <RecentTable>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Placed</th>
                      <th style={{ textAlign: "right" }}>Total</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.ref}>
                        <td>
                          <Mono>
                            <Link href={`/admin/orders/${o.ref}`}>{o.ref}</Link>
                          </Mono>
                        </td>
                        <td>{o.customerName}</td>
                        <td style={{ color: "#a89880" }}>
                          {new Date(o.placedISO).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Mono>{o.totalDisplay}</Mono>
                        </td>
                        <td>
                          <PaymentTag $tone={o.payment}>{o.payment}</PaymentTag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </RecentTable>

                {/* Mobile card list — same data, phone-friendly. */}
                <RecentCardList>
                  {stats.recentOrders.map((o) => (
                    <RecentCard key={`m-${o.ref}`}>
                      <RecentTop>
                        <RecentRefLink href={`/admin/orders/${o.ref}`}>
                          {o.ref}
                        </RecentRefLink>
                        <PaymentTag $tone={o.payment}>{o.payment}</PaymentTag>
                      </RecentTop>
                      <RecentCust>{o.customerName}</RecentCust>
                      <RecentFoot>
                        <span>
                          {new Date(o.placedISO).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className="total">{o.totalDisplay}</span>
                      </RecentFoot>
                    </RecentCard>
                  ))}
                </RecentCardList>
              </>
            )}
          </Card>

          <QuickLinks aria-label="Go to">
            <QuickLink href="/admin/orders">
              <h3>Orders</h3>
              <p>Queue, filters, per-order detail and fulfillment.</p>
              <span className="go">Open →</span>
            </QuickLink>
            <QuickLink href="/admin/products">
              <h3>Products</h3>
              <p>Approve prices, adjust caps, toggle shoppable.</p>
              <span className="go">Open →</span>
            </QuickLink>
            <QuickLink href="/admin/finance">
              <h3>Finance</h3>
              <p>Monthly report, reconciliation, Stripe sync.</p>
              <span className="go">Open →</span>
            </QuickLink>
          </QuickLinks>
        </SectionGrid>
      </Wrap>
    </Page>
  );
}
