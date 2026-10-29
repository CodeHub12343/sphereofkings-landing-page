import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import SponsorDashboard from "@/components/sponsor/SponsorDashboard";
import { getSponsorSession } from "@/lib/auth/sponsor-session";
import {
  CAMPAIGN_DAYS,
  COMMITMENTS,
  KICKSTARTER_LAUNCH_DATE,
  tier as tierOf,
} from "@/lib/sponsorship";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsor Dashboard — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function SponsorPage() {
  const row = await getSponsorSession();
  if (!row) redirect("/sponsor/signin");

  const t = tierOf(row.tier);
  const commitments = COMMITMENTS[row.tier];
  const activities = (row.activities ?? []).slice().sort((a, b) =>
    a.publishedISO < b.publishedISO ? 1 : -1,
  );

  return (
    <>
      <Header />
      <main style={{ background: "#0a0a0a", minHeight: "60vh" }}>
        <section
          style={{
            padding: "clamp(32px, 5vw, 64px) 0 clamp(60px, 8vw, 112px)",
          }}
        >
          <Wrap>
            <SponsorDashboard
              sponsorshipRef={row.ref}
              tierName={t.name}
              tierPriceDisplay={t.priceDisplay}
              businessName={row.businessName}
              contactName={row.contactName}
              contactEmail={row.contactEmail}
              campaignStartISO={row.campaignStartISO ?? row.paidISO ?? row.createdISO}
              campaignDays={CAMPAIGN_DAYS}
              kickstarterLaunchDate={KICKSTARTER_LAUNCH_DATE}
              commitments={commitments}
              activities={activities}
              brandAssets={row.brandAssets ?? {}}
              existingWebsite={row.businessWebsite}
            />
          </Wrap>
        </section>
      </main>
      <Footer />
    </>
  );
}
