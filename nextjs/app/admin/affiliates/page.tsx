import Link from "next/link";
import { Wrap } from "@/components/shared";
import AffiliatesAdmin from "@/components/admin/AffiliatesAdmin";
import { aggregateByAffiliate } from "@/lib/db/collections/attributed-orders";
import { listAffiliates } from "@/lib/db/collections/affiliates";
import { countPendingWithdrawalRequests } from "@/lib/db/collections/withdrawal-requests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Affiliates · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function AdminAffiliatesPage() {
  // Three sources read in parallel. Affiliates are the actual records
  // (seeded from SAMPLE_AFFILIATES on an empty collection); aggregates
  // are rolled up per-code from attributedOrders; pending-withdrawals
  // count drives the queue badge below.
  const [affiliates, aggregates, pendingWithdrawals] = await Promise.all([
    listAffiliates(),
    aggregateByAffiliate(),
    countPendingWithdrawalRequests().catch(() => 0),
  ]);

  return (
    <section style={pageStyle}>
      <Wrap>
        <header style={headStyle}>
          <h1 style={h1Style}>Affiliates</h1>
          <p style={pStyle}>
            Approve new applications and suspend misbehaving accounts. Each
            row's record lives in the <strong>affiliates</strong> collection;
            counts and commissions come from <strong>attributedOrders</strong>
            and flip as the Stripe webhook confirms payments.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/admin/affiliates/requests"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 8,
                background: pendingWithdrawals > 0 ? "rgba(240, 192, 64, 0.14)" : "#1a1612",
                border: `1px solid ${pendingWithdrawals > 0 ? "#f0c040" : "#2e2618"}`,
                color: pendingWithdrawals > 0 ? "#f0c040" : "#a89880",
                fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Withdrawal requests
              {pendingWithdrawals > 0 && (
                <span style={{
                  background: "#f0c040", color: "#0a0a0a",
                  padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800,
                }}>
                  {pendingWithdrawals} pending
                </span>
              )}
            </Link>
          </div>
        </header>
        <AffiliatesAdmin affiliates={affiliates} aggregates={aggregates} />
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
  maxWidth: 720,
};
