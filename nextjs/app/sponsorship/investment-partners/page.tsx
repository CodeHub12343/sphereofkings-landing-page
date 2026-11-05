import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import InvestorInquiryForm from "./InvestorInquiryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Investment Partners Portal · Sphere of Kings",
  description:
    "Apply for information on larger Sphere of Kings investment partnerships — dividend-eligible positions, strategic sponsorships and bigger-ROI structures beyond the standard Kickstarter tiers.",
};

const PILLARS: { heading: string; body: string }[] = [
  {
    heading: "Beyond the Silver & Gold tiers",
    body: "Silver ($3k) and Gold Premier ($10k) are fixed-price promotional slots. The Investment Partners track is for commitments above that — structured as equity, revenue share, or strategic sponsorships tied to naming rights, tournaments, retail rollouts and licensing.",
  },
  {
    heading: "Dividend-eligible positions",
    body: "Qualifying partners share in distributable profits per the terms of each agreement. Structure, payout cadence, preference and vesting are set in writing before any capital moves.",
  },
  {
    heading: "Bigger-ROI structures",
    body: "We tailor each partnership to the partner's thesis — early-stage equity, sponsor-plus-equity hybrids, category exclusivity, regional licensing, or retail distribution participation. All terms negotiated directly with James.",
  },
  {
    heading: "What you receive after applying",
    body: "The current Investment Partners deck, the Master Blueprint, the Shark-Ready buybox and due-diligence packet, and a direct introduction to James for a 1:1 call.",
  },
];

export default function InvestmentPartnersPage() {
  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a" }}>
        <section
          style={{
            padding: "clamp(48px, 7vw, 96px) 0 clamp(32px, 5vw, 64px)",
            borderBottom: "1px solid #1a1510",
            background:
              "radial-gradient(ellipse at top, rgba(201,162,39,0.1), transparent 60%), #0a0a0a",
          }}
        >
          <Wrap>
            <div
              style={{
                maxWidth: 820,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#c9a227",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}
              >
                Investment Partners · By Application
              </p>
              <h1
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                  fontSize: "clamp(2rem, 4.4vw, 3.2rem)",
                  fontWeight: 900,
                  margin: "0 0 18px",
                  background:
                    "linear-gradient(90deg,#c9a227 0%,#f0c040 50%,#c9a227 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.1,
                }}
              >
                Larger investments. Bigger ROI. Dividend-eligible partnerships.
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "#a89880",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                A private portal for investors and strategic partners who want
                more than a promotional slot. Apply to receive the Investment
                Partners deck, review the structure, and schedule a direct
                conversation with James about dividend-eligible positions and
                bigger-ROI partnership terms.
              </p>
              <p style={{ margin: "22px 0 0" }}>
                <Link
                  href="/sponsorship"
                  style={{
                    color: "#a89880",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.88rem",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  ← Back to standard Silver &amp; Gold sponsorship
                </Link>
              </p>
            </div>
          </Wrap>
        </section>

        <section
          style={{
            padding: "clamp(48px, 6vw, 80px) 0",
          }}
        >
          <Wrap>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
                maxWidth: 1080,
                margin: "0 auto 48px",
              }}
            >
              {PILLARS.map((p) => (
                <div
                  key={p.heading}
                  style={{
                    background: "#0e0c09",
                    border: "1px solid #1e1a12",
                    borderRadius: 12,
                    padding: "22px 22px 20px",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 10px",
                      color: "#f5f0e8",
                      fontFamily: "'Cinzel', Georgia, serif",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                    }}
                  >
                    {p.heading}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "#a89880",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.92rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ maxWidth: 680, margin: "0 auto" }}>
              <InvestorInquiryForm />
            </div>
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
