"use client";

import styled from "styled-components";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDashboard from "./AffiliateDashboard";
import WithdrawalPanel from "./WithdrawalPanel";
import { Wrap } from "@/components/shared";
import {
  SAMPLE_AFFILIATE,
  Affiliate as DashboardAffiliate,
  AttributedStatus,
  AttributedRow,
} from "@/lib/affiliate";
import { SampleAffiliate, fullName } from "@/lib/sample-affiliates";

// Exported for the server page that composes this shell. Mirrors the
// stored attribution record projected into the dashboard's row shape,
// with a commission amount in minor units so the UI can format cleanly.
export type AttributedRowView = {
  dateISO: string;
  orderRef: string;
  customer: string;
  units: number;
  status: AttributedStatus;
  commissionAmountMinor: number;
  sharePct: number;
  touch: "first" | "last" | "sole";
};

const Section = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
  /* Belt-and-braces guard against any inner element (long affiliate
     URL, poster preview) nudging the viewport sideways on phones. */
  overflow-x: hidden;
`;

const SignedInBar = styled.div`
  background: rgba(79, 176, 125, 0.06);
  border: 1px solid #4fb07d;
  border-radius: 10px;
  padding: 10px 16px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  strong {
    color: #4fb07d;
    font-weight: 800;
  }
  .me {
    color: #f5f0e8;
    font-weight: 600;
  }
`;

const SignOut = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #a89880;
  text-decoration: none;
  padding: 5px 12px;
  border: 1px solid #2e2618;
  border-radius: 6px;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

export type AffiliateMoneyTotals = {
  pendingCommissionMinor: number;
  approvedCommissionMinor: number;
  paidOutCommissionMinor: number;
  // Split of `approvedCommissionMinor`:
  //   availableCommissionMinor — eligible rows NOT locked to a request
  //   lockedInRequestMinor     — eligible rows locked to an open request
  availableCommissionMinor?: number;
  lockedInRequestMinor?: number;
};

export type WithdrawalRequestView = {
  id: string;
  status: "pending" | "approved" | "completed" | "rejected";
  amountMinor: number;
  requestedISO: string;
  decisionISO?: string;
  completedISO?: string;
  rejectReason?: string;
  payoutMethod: "bank" | "wise" | "paypal";
};

// Build the dashboard shape from the admin record plus live attribution
// rows. When Mongo has rows for this affiliate, counts and commissions
// come from the store; the hardcoded SAMPLE_AFFILIATE only backs the
// POSTER-247 demo view and only when the store is empty for them.
function toDashboardAffiliate(
  sa: SampleAffiliate,
  rows: AttributedRowView[],
  totals?: AffiliateMoneyTotals,
): DashboardAffiliate {
  const liveRows: AttributedRow[] = rows.map((r) => ({
    dateISO: r.dateISO,
    orderRef: r.orderRef,
    customer: r.customer,
    units: r.units,
    status: r.status,
    sharePct: r.sharePct,
    touch: r.touch,
    commissionAmountMinor: r.commissionAmountMinor,
  }));
  // Production posture: never substitute the hardcoded SAMPLE_AFFILIATE
  // demo rows for a real signed-in affiliate's missing data. Empty is
  // honest; the dashboard already handles zero rows cleanly.
  void SAMPLE_AFFILIATE;
  const nextThreshold =
    sa.tier === "Starter"
      ? 50
      : sa.tier === "Silver"
      ? 100
      : sa.tier === "Gold"
      ? 500
      : sa.tier === "Royal"
      ? 1000
      : sa.tier === "Imperial"
      ? 5000
      : 10000;
  const nextName =
    sa.tier === "Starter"
      ? "Silver"
      : sa.tier === "Silver"
      ? "Gold"
      : sa.tier === "Gold"
      ? "Royal"
      : sa.tier === "Royal"
      ? "Imperial"
      : sa.tier === "Imperial"
      ? "Sovereign"
      : "Sovereign";
  const nextRate =
    sa.tier === "Starter"
      ? 10
      : sa.tier === "Silver"
      ? 15
      : sa.tier === "Gold"
      ? 20
      : sa.tier === "Royal"
      ? 25
      : 30;
  return {
    code: sa.code,
    firstName: sa.firstName,
    tier: {
      name: sa.tier,
      rate: sa.tierRatePct,
      nextName,
      nextRate,
    },
    eligibleSales: sa.eligibleSales,
    nextThreshold,
    salesLastWeek: 0,
    pendingOrders: sa.pendingOrders,
    period: { label: "Last 30 days" },
    approvedPendingSync: true,
    referralUrl: `sphereofkings.com/r/${sa.code}`,
    // Live attribution rows only — never fabricated.
    rows: liveRows,
    // Real counts from the live rows, overriding anything on the admin
    // record that would have carried demo numbers.
    eligibleSales: liveRows.filter((r) => r.status === "eligible").length,
    pendingOrders: liveRows.filter((r) => r.status === "pending").length,
    // Money totals from the server page, when provided. These flow into
    // the dashboard KPI tiles.
    pendingCommissionMinor: totals?.pendingCommissionMinor,
    approvedCommissionMinor: totals?.approvedCommissionMinor,
    paidOutCommissionMinor: totals?.paidOutCommissionMinor,
  };
}

export default function AffiliateAuthedShell({
  affiliate,
  attributedRows = [],
  totals,
  withdrawalRequests = [],
  payoutConfigured = false,
}: {
  // Live record from the Mongo `affiliates` collection, fetched by the
  // server page before render. Nothing here calls back to the DB.
  affiliate: SampleAffiliate;
  attributedRows?: AttributedRowView[];
  totals?: AffiliateMoneyTotals;
  withdrawalRequests?: WithdrawalRequestView[];
  payoutConfigured?: boolean;
}) {
  const dashboardAff = toDashboardAffiliate(
    affiliate,
    attributedRows,
    totals,
  );
  const displayName = fullName(affiliate);

  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <SignedInBar role="note">
              <span>
                <strong>Signed in</strong> as{" "}
                <span className="me">{displayName}</span> ·{" "}
                <code
                  style={{
                    fontFamily:
                      "SFMono-Regular, Menlo, Consolas, monospace",
                    color: "#f0c040",
                  }}
                >
                  {dashboardAff.code}
                </code>
              </span>
              <SignOut href="/affiliate/signout">Sign out</SignOut>
            </SignedInBar>
            <AffiliateDashboard affiliate={dashboardAff} />
            <WithdrawalPanel
              availableMinor={totals?.availableCommissionMinor ?? 0}
              lockedMinor={totals?.lockedInRequestMinor ?? 0}
              paidOutMinor={totals?.paidOutCommissionMinor ?? 0}
              payoutConfigured={payoutConfigured}
              requests={withdrawalRequests}
            />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
