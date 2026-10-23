import Link from "next/link";
import { notFound } from "next/navigation";
import { Wrap } from "@/components/shared";
import { findWithdrawalRequestById } from "@/lib/db/collections/withdrawal-requests";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import { listAttributionsByOrderRef } from "@/lib/db/collections/attributed-orders";
import { findOrderByRef } from "@/lib/db/collections/orders";
import WithdrawalRequestActions from "@/components/admin/WithdrawalRequestActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Withdrawal request · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

const fmt = (minor: number) => `$${(minor / 100).toFixed(2)}`;

export default async function AdminWithdrawalRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const req = await findWithdrawalRequestById(id);
  if (!req) notFound();
  const aff = await findAffiliateByCode(req.affiliateCode);

  // Load the orders in this request for a transparent per-order list.
  const orderRows = await Promise.all(
    req.orderRefs.map(async (ref) => {
      const [attrs, order] = await Promise.all([
        listAttributionsByOrderRef(ref),
        findOrderByRef(ref),
      ]);
      const mine = attrs.find((a) => a.affiliateCode === req.affiliateCode);
      return {
        ref,
        placedISO: mine?.placedISO ?? "",
        commissionAmountMinor: mine?.commissionAmountMinor ?? 0,
        customer: order?.customerName ?? "—",
        totalMinor: mine?.orderTotalMinor ?? 0,
        tierPct: mine?.commissionTierPct ?? 0,
      };
    }),
  );

  const dim = { fontFamily: "'Inter', sans-serif", color: "#a89880", fontSize: "0.82rem" } as const;
  const label = { ...dim, textTransform: "uppercase" as const, letterSpacing: "0.12em", fontWeight: 700, fontSize: "0.7rem" };

  return (
    <section style={{ padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)" }}>
      <Wrap>
        <p style={{ margin: "0 0 12px" }}>
          <Link href="/admin/affiliates/requests" style={{ ...dim, textDecoration: "none" }}>
            ← All requests
          </Link>
        </p>

        <header style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif", color: "#f5f0e8",
            fontSize: "clamp(1.5rem, 3vw, 2rem)", margin: 0, fontWeight: 800,
          }}>
            {fmt(req.amountMinor)} · {req.affiliateCode}
          </h1>
          <StatusChip status={req.status} />
        </header>

        <div style={{
          display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          marginBottom: 24,
        }}>
          <Card>
            <div style={label}>Affiliate</div>
            <div style={{ color: "#f5f0e8", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", marginTop: 6 }}>
              {aff ? `${aff.firstName} ${aff.lastName}` : req.affiliateCode}
            </div>
            <div style={{ ...dim, marginTop: 2 }}>{aff?.email ?? ""}</div>
            <div style={{ ...dim, marginTop: 10 }}>
              Tier: {aff?.tier} ({aff?.tierRatePct}%)
              {aff?.customRatePct != null && (
                <span style={{ color: "#f0c040", marginLeft: 6 }}>
                  · custom {aff.customRatePct}%
                </span>
              )}
            </div>
          </Card>

          <Card>
            <div style={label}>Payout destination (snapshot)</div>
            <div style={{ color: "#f5f0e8", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", marginTop: 6 }}>
              {req.payoutMethod === "bank"
                ? "Bank transfer"
                : req.payoutMethod === "wise"
                  ? "Wise"
                  : "PayPal"}
            </div>
            <pre style={{
              marginTop: 6, color: "#f0c040", background: "#1a1612",
              padding: "10px 12px", borderRadius: 8, border: "1px solid #2e2618",
              fontFamily: "SFMono-Regular, Menlo, Consolas, monospace", fontSize: "0.82rem",
              whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "6px 0 0",
            }}>
              {req.payoutDetails}
            </pre>
          </Card>

          <Card>
            <div style={label}>Request</div>
            <div style={dim}>Opened {new Date(req.requestedISO).toLocaleString()}</div>
            {req.decisionISO && (
              <div style={dim}>
                Decided {new Date(req.decisionISO).toLocaleString()}
                {req.decisionAdminLabel ? ` by ${req.decisionAdminLabel}` : ""}
              </div>
            )}
            {req.completedISO && (
              <div style={dim}>
                Completed {new Date(req.completedISO).toLocaleString()}
                {req.completedReference ? ` · ref ${req.completedReference}` : ""}
              </div>
            )}
            {req.adminNote && (
              <div style={{ ...dim, marginTop: 8, color: "#f5f0e8" }}>Note: {req.adminNote}</div>
            )}
            {req.rejectReason && (
              <div style={{ ...dim, marginTop: 8, color: "#ff6b7a" }}>
                Rejected: {req.rejectReason}
              </div>
            )}
          </Card>
        </div>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: "'Inter', sans-serif", color: "#a89880",
            fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em",
            fontWeight: 700, margin: "0 0 10px",
          }}>
            Orders in this request ({orderRows.length})
          </h2>
          <div style={{
            background: "#0e0c09", border: "1px solid #1e1a12", borderRadius: 10, overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1fr 80px 1fr",
              padding: "10px 14px", borderBottom: "1px solid #1e1a12",
              ...label,
            }}>
              <span>Order</span><span>Customer</span>
              <span style={{ textAlign: "right" }}>Order total</span>
              <span style={{ textAlign: "right" }}>Rate</span>
              <span style={{ textAlign: "right" }}>Commission</span>
            </div>
            {orderRows.map((r) => (
              <div key={r.ref} style={{
                display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1fr 80px 1fr",
                padding: "10px 14px", borderBottom: "1px solid #1a1612",
                fontFamily: "'Inter', sans-serif", fontSize: "0.86rem", color: "#f5f0e8",
                alignItems: "center",
              }}>
                <span><Link href={`/admin/orders/${r.ref}`} style={{ color: "#f0c040", textDecoration: "none" }}>{r.ref}</Link></span>
                <span style={{ color: "#a89880" }}>{r.customer}</span>
                <span style={{ textAlign: "right", color: "#a89880", fontVariantNumeric: "tabular-nums" }}>
                  {r.totalMinor ? fmt(r.totalMinor) : "—"}
                </span>
                <span style={{ textAlign: "right", color: "#a89880" }}>{r.tierPct}%</span>
                <span style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(r.commissionAmountMinor)}
                </span>
              </div>
            ))}
            <div style={{
              display: "grid", gridTemplateColumns: "1.1fr 1.4fr 1fr 80px 1fr",
              padding: "12px 14px", background: "#1a1612",
              fontFamily: "'Inter', sans-serif", fontSize: "0.92rem", color: "#f0c040", fontWeight: 700,
            }}>
              <span>Total</span><span></span><span></span><span></span>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {fmt(req.amountMinor)}
              </span>
            </div>
          </div>
        </section>

        <WithdrawalRequestActions
          id={req.id}
          status={req.status}
          amountDisplay={fmt(req.amountMinor)}
        />
      </Wrap>
    </section>
  );
}

function StatusChip({ status }: { status: string }) {
  const color =
    status === "pending" ? "#f0c040"
      : status === "approved" ? "#4ea9ff"
        : status === "completed" ? "#4fb07d"
          : "#ff6b7a";
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 999, background: `${color}22`, color,
      fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.1em",
    }}>
      {status}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0e0c09", border: "1px solid #1e1a12", borderRadius: 10, padding: 16,
    }}>
      {children}
    </div>
  );
}
