import { notFound } from "next/navigation";
import Link from "next/link";
import { Wrap } from "@/components/shared";
import SponsorAdminEditor from "@/components/admin/SponsorAdminEditor";
import { findSponsorshipByRef } from "@/lib/db/collections/sponsorships";
import {
  CAMPAIGN_DAYS,
  COMMITMENTS,
  KICKSTARTER_LAUNCH_DATE,
  tier as tierOf,
} from "@/lib/sponsorship";

export const dynamic = "force-dynamic";

export default async function AdminSponsorshipDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const row = await findSponsorshipByRef(ref);
  if (!row) notFound();
  const t = tierOf(row.tier);
  const activities = (row.activities ?? [])
    .slice()
    .sort((a, b) => (a.publishedISO < b.publishedISO ? 1 : -1));
  return (
    <section
      style={{ padding: "clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px)" }}
    >
      <Wrap>
        <Link
          href="/admin/sponsorships"
          style={{
            color: "#a89880",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          ← All sponsorships
        </Link>
        <header style={{ margin: "12px 0 20px" }}>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#f5f0e8",
              fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
              margin: 0,
              fontWeight: 800,
            }}
          >
            {row.businessName}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "#a89880",
              fontSize: "0.95rem",
              margin: "6px 0 0",
            }}
          >
            {t.name} · {t.priceDisplay} · {row.state.toUpperCase()} · {row.ref}
          </p>
        </header>
        <SponsorAdminEditor
          sponsorshipRef={row.ref}
          tier={row.tier}
          state={row.state}
          tierName={t.name}
          contactName={row.contactName}
          contactEmail={row.contactEmail}
          contactPhone={row.contactPhone}
          businessWebsite={row.businessWebsite}
          businessCategory={row.businessCategory}
          notes={row.notes}
          campaignStartISO={row.campaignStartISO ?? row.paidISO ?? row.createdISO}
          campaignDays={CAMPAIGN_DAYS}
          kickstarterLaunchDate={KICKSTARTER_LAUNCH_DATE}
          commitments={COMMITMENTS[row.tier]}
          activities={activities}
          brandAssets={row.brandAssets ?? {}}
        />
      </Wrap>
    </section>
  );
}
