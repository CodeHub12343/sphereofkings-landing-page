"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import { SAMPLE_ORDERS } from "@/lib/sample-orders";

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

const KpiV = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f5f0e8;
  margin: 8px 0 2px;
  font-variant-numeric: tabular-nums;
`;

const KpiD = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  color: #a89880;
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

export default function AdminOverviewPage() {
  const totalOrders = SAMPLE_ORDERS.length;
  const needsAttention = SAMPLE_ORDERS.filter(
    (o) =>
      o.payment === "pending" ||
      o.payment === "failed" ||
      o.payment === "refund-pending",
  ).length;
  const dispatchedToday = SAMPLE_ORDERS.filter(
    (o) => o.fulfillment === "dispatched",
  ).length;

  return (
    <Page>
      <Wrap>
        <DemoBanner />
        <Head>
          <h1>Overview</h1>
          <p>
            Headline numbers across the Early Bird channel. Everything on this
            page is derived from sample records until orders persist.
          </p>
        </Head>

        <KPIs aria-label="Headline figures">
          <Kpi>
            <KpiK>Orders · all time</KpiK>
            <KpiV>{totalOrders}</KpiV>
            <KpiD>Sample data</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Needs attention</KpiK>
            <KpiV style={{ color: "#e0a94a" }}>{needsAttention}</KpiV>
            <KpiD>Pending · failed · refund-pending</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Dispatched</KpiK>
            <KpiV>{dispatchedToday}</KpiV>
            <KpiD>In the current sample window</KpiD>
          </Kpi>
          <Kpi>
            <KpiK>Revenue</KpiK>
            <KpiV style={{ color: "#5a4a38", fontSize: "1.1rem" }}>
              pending prices
            </KpiV>
            <KpiD>Enable once products have approved prices</KpiD>
          </Kpi>
        </KPIs>

        <QuickLinks aria-label="Go to">
          <QuickLink href="/admin/orders">
            <h3>Orders</h3>
            <p>
              The full queue — filter by Early Bird, Kickstarter, Wholesale or
              Needs attention.
            </p>
            <span className="go">Open →</span>
          </QuickLink>
          <QuickLink
            href="#"
            onClick={(e) => e.preventDefault()}
            aria-disabled="true"
            style={{ opacity: 0.6 }}
          >
            <h3>Products</h3>
            <p>Approve prices, adjust the 1,000-unit cap and manage images.</p>
            <span className="go" style={{ color: "#5a4a38" }}>
              Not built yet
            </span>
          </QuickLink>
          <QuickLink
            href="#"
            onClick={(e) => e.preventDefault()}
            aria-disabled="true"
            style={{ opacity: 0.6 }}
          >
            <h3>Finance</h3>
            <p>Monthly report, reconciliation and expense entry.</p>
            <span className="go" style={{ color: "#5a4a38" }}>
              Not built yet
            </span>
          </QuickLink>
        </QuickLinks>
      </Wrap>
    </Page>
  );
}
