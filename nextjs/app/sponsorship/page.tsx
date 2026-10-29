import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import SponsorshipPanel from "@/components/sponsorship/SponsorshipPanel";
import { allTiers, KICKSTARTER_LAUNCH_DATE } from "@/lib/sponsorship";
import { getSponsorshipAvailability } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Official Kickstarter Sponsorship · Sphere of Kings",
  description:
    "Become an official Sphere of Kings Kickstarter sponsor. Silver ($3,000) and Gold Premier ($10,000) 90-day promotional partnerships available for purchase.",
};

export default async function SponsorshipPage() {
  const availability = await getSponsorshipAvailability();
  const tiers = allTiers();
  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a" }}>
        <section
          style={{
            padding: "clamp(48px, 7vw, 96px) 0 clamp(32px, 5vw, 64px)",
            borderBottom: "1px solid #1a1510",
            background:
              "radial-gradient(ellipse at top, rgba(201,162,39,0.08), transparent 60%), #0a0a0a",
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
                Official Kickstarter Sponsorship
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
                Become an official Sphere&nbsp;of&nbsp;Kings sponsor.
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
                A 90-day promotional partnership built around our Kickstarter
                launch on <strong style={{ color: "#f5f0e8" }}>
                  {KICKSTARTER_LAUNCH_DATE}
                </strong>
                . Only {tiers[0].totalSlots} Silver and {tiers[1].totalSlots} Gold
                Premier slots are available — pick a tier, pay, and we'll
                reach out to confirm your brand assets within one business
                day.
              </p>
            </div>
          </Wrap>
        </section>

        <section
          style={{
            padding: "clamp(48px, 6vw, 80px) 0 clamp(64px, 8vw, 112px)",
          }}
        >
          <Wrap>
            <SponsorshipPanel availability={availability} tiers={tiers} />
            <p
              style={{
                textAlign: "center",
                color: "#5a4a38",
                fontSize: "0.78rem",
                lineHeight: 1.55,
                margin: "48px auto 0",
                maxWidth: 760,
              }}
            >
              All promotional deliverables, schedules, advertising budgets,
              content approvals and placement terms are confirmed in a
              written sponsorship agreement delivered after payment.
              Audience reach, sales and Kickstarter funding results are not
              guaranteed. Paid advertising costs are separate unless
              specifically included in the agreement.
            </p>
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
