import Link from "next/link";
import { Wrap } from "@/components/shared";
import { listWithdrawalRequests } from "@/lib/db/collections/withdrawal-requests";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Withdrawal requests · Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

const fmt = (minor: number) => `$${(minor / 100).toFixed(2)}`;

const toneFor = (status: string) =>
  status === "pending"
    ? "#f0c040"
    : status === "approved"
      ? "#4ea9ff"
      : status === "completed"
        ? "#4fb07d"
        : "#ff6b7a";

export default async function AdminWithdrawalRequestsPage() {
  const [pending, approved, completed, rejected] = await Promise.all([
    listWithdrawalRequests({ status: "pending" }),
    listWithdrawalRequests({ status: "approved" }),
    listWithdrawalRequests({ status: "completed" }),
    listWithdrawalRequests({ status: "rejected" }),
  ]);

  const sections = [
    { title: "Pending", rows: pending },
    { title: "Approved — awaiting payment", rows: approved },
    { title: "Completed", rows: completed.slice(0, 50) },
    { title: "Rejected", rows: rejected.slice(0, 25) },
  ];

  return (
    <section style={{ padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)" }}>
      <Wrap>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif", color: "#f5f0e8",
            fontSize: "clamp(1.6rem, 3vw, 2.1rem)", margin: "0 0 6px", fontWeight: 800,
          }}>
            Withdrawal requests
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif", color: "#a89880",
            fontSize: "0.92rem", margin: 0, lineHeight: 1.55, maxWidth: 720,
          }}>
            Affiliate payout requests. Approve to confirm you'll pay, then
            mark completed once the bank transfer / PayPal send is done.
            Completion flips the attributed orders to paid-out and emails
            the affiliate a statement.
          </p>
          <p style={{
            marginTop: 14,
            fontFamily: "'Inter', sans-serif", color: "#5a4a38",
            fontSize: "0.82rem", margin: "14px 0 0",
          }}>
            <Link href="/admin/affiliates" style={{ color: "#a89880", textDecoration: "none" }}>
              ← All affiliates
            </Link>
          </p>
        </header>

        {sections.map((s) => (
          <section key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 700,
              color: "#a89880", fontSize: "0.78rem", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 10px",
            }}>
              {s.title} · {s.rows.length}
            </h2>
            {s.rows.length === 0 ? (
              <div style={{
                background: "#0e0c09", border: "1px dashed #1e1a12", borderRadius: 10,
                padding: 16, color: "#5a4a38", fontFamily: "'Inter', sans-serif", fontSize: "0.86rem",
              }}>
                No {s.title.toLowerCase()} requests.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.rows.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/affiliates/requests/${r.id}`}
                    style={{
                      background: "#0e0c09", border: "1px solid #1e1a12", borderRadius: 10,
                      padding: "14px 16px", textDecoration: "none",
                      display: "grid",
                      gridTemplateColumns: "90px 1fr 120px 110px",
                      gap: 14, alignItems: "center",
                    }}
                  >
                    <span style={{
                      display: "inline-block", padding: "3px 8px", borderRadius: 999,
                      background: `${toneFor(r.status)}22`, color: toneFor(r.status),
                      fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center",
                    }}>
                      {r.status}
                    </span>
                    <span style={{ color: "#f5f0e8", fontFamily: "'Inter', sans-serif", fontSize: "0.92rem" }}>
                      <strong>{r.affiliateCode}</strong> ·{" "}
                      <span style={{ color: "#a89880" }}>
                        {r.orderRefs.length} order{r.orderRefs.length === 1 ? "" : "s"} ·{" "}
                        {r.payoutMethod}
                      </span>
                    </span>
                    <span style={{
                      color: "#f5f0e8", fontFamily: "'Inter', sans-serif", fontWeight: 700,
                      textAlign: "right", fontVariantNumeric: "tabular-nums",
                    }}>
                      {fmt(r.amountMinor)}
                    </span>
                    <span style={{
                      color: "#5a4a38", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem",
                      textAlign: "right",
                    }}>
                      {new Date(r.requestedISO).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </Wrap>
    </section>
  );
}
