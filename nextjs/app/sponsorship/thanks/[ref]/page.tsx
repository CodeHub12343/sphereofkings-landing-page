import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { findSponsorshipByRef } from "@/lib/db/collections/sponsorships";
import {
  KICKSTARTER_LAUNCH_DATE,
  tier as tierOf,
} from "@/lib/sponsorship";

export const dynamic = "force-dynamic";

export default async function SponsorshipThanksPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const row = await findSponsorshipByRef(ref);
  if (!row) notFound();
  const t = tierOf(row.tier);
  const confirmed = row.state === "paid";

  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a", minHeight: "60vh" }}>
        <section
          style={{
            padding: "clamp(48px, 7vw, 96px) 0 clamp(64px, 8vw, 112px)",
          }}
        >
          <Wrap>
            <div
              style={{
                maxWidth: 640,
                margin: "0 auto",
                background: "#0e0c09",
                border: `1.5px solid ${confirmed ? "#4fb07d" : "#c9a227"}`,
                borderRadius: 14,
                padding: "clamp(28px, 4vw, 44px)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: confirmed ? "#4fb07d" : "#c9a227",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                }}
              >
                {confirmed ? "Payment Confirmed" : "Payment Processing"}
              </p>
              <h1
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)",
                  color: "#f5f0e8",
                  margin: "0 0 14px",
                  fontWeight: 800,
                }}
              >
                {confirmed
                  ? `Welcome to Sphere of Kings, ${row.businessName}.`
                  : "Thanks — we're confirming your payment."}
              </h1>
              <p
                style={{
                  color: "#a89880",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  margin: "0 0 20px",
                }}
              >
                {confirmed ? (
                  <>
                    Your <strong style={{ color: "#f5f0e8" }}>{t.name}</strong>{" "}
                    ({t.priceDisplay}) is secured. We sent a receipt and
                    welcome packet to the email on file. James will reach out
                    within one business day to finalize brand assets.
                  </>
                ) : (
                  <>
                    Your card has been submitted. Stripe sometimes takes a few
                    seconds — refresh this page in a moment, or watch for the
                    receipt in your inbox. If anything looks wrong, contact
                    James right away.
                  </>
                )}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 14,
                  background: "#0a0806",
                  borderRadius: 10,
                  border: "1px solid #1a1510",
                  color: "#d9cfbe",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  margin: "0 0 20px",
                }}
              >
                <div>
                  <span style={{ color: "#a89880" }}>Reservation</span>{" "}
                  <strong>{row.ref}</strong>
                </div>
                <div>
                  <span style={{ color: "#a89880" }}>Package</span>{" "}
                  <strong>{t.name}</strong>
                </div>
                <div>
                  <span style={{ color: "#a89880" }}>Amount</span>{" "}
                  <strong>{t.priceDisplay}</strong>
                </div>
                <div>
                  <span style={{ color: "#a89880" }}>
                    Kickstarter launches
                  </span>{" "}
                  <strong>{KICKSTARTER_LAUNCH_DATE}</strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {confirmed && (
                  <Link
                    href="/sponsor/signin"
                    style={{
                      display: "inline-block",
                      color: "#0a0a0a",
                      background:
                        "linear-gradient(135deg,#b8901e 0%,#f0c040 50%,#b8901e 100%)",
                      fontFamily: "'Cinzel', serif",
                      fontSize: "0.9rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      padding: "10px 20px",
                      border: 0,
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    Open sponsor dashboard
                  </Link>
                )}
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    color: "#c9a227",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.9rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "10px 20px",
                    border: "1px solid #c9a227",
                    borderRadius: 4,
                  }}
                >
                  Back to Sphere of Kings
                </Link>
              </div>
            </div>
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
