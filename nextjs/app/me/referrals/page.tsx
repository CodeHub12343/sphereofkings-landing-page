import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { ensureReferralIndexes, getOrCreateCodeForPlayer } from "@/lib/db/collections/referrals";
import { getDb } from "@/lib/db/mongo";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FSectionTitle } from "@/components/feature/primitives";
import ShareBox from "./ShareBox";

export const dynamic = "force-dynamic";

export default async function MyReferralsPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/referrals");

  await ensureReferralIndexes().catch(() => {});
  const row = await getOrCreateCodeForPlayer(me.id);

  const db = await getDb();
  const [clicks, verified] = await Promise.all([
    db.collection("referralEvents").countDocuments({ code: row.code, kind: "click" }).catch(() => 0),
    db.collection("referralEvents").countDocuments({ code: row.code, verified: true }).catch(() => 0),
  ]);

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sphereofkings.com";
  const shareUrl = `${origin}/r/${row.code}`;

  return (
    <FeaturePage
      eyebrow="Royal Sphere Giveaway"
      title="Your referral link"
      subtitle="Share your link. Every 100 verified entrants wins one person a free Sphere of Kings game board."
      narrow
    >
      <ShareBox code={row.code} url={shareUrl} />

      <FGrid $min="200px" style={{ marginTop: 28 }}>
        <FCard>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
                        letterSpacing: ".14em", marginBottom: 6 }}>Clicks</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28,
                         color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>
            {clicks.toLocaleString()}
          </div>
        </FCard>
        <FCard>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
                        letterSpacing: ".14em", marginBottom: 6 }}>Verified entries</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28,
                         color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>
            {verified.toLocaleString()}
          </div>
        </FCard>
      </FGrid>

      <section style={{ marginTop: 32 }}>
        <FSectionTitle>How it counts</FSectionTitle>
        <ol style={{ color: "var(--text,#f5f0e8)", lineHeight: 1.75, paddingLeft: 20 }}>
          <li>Someone opens your link — a <strong>click</strong> is recorded.</li>
          <li>They browse the site; the attribution cookie lasts 30 days.</li>
          <li>If they create a verified account or confirmed subscription within that window,
            a <strong>verified entry</strong> is credited to you.</li>
          <li>When the global pool reaches 100 verified entries, the round seals.
            50 qualifiers are selected by objective rules and 1 random winner draws the prize.</li>
        </ol>
      </section>
    </FeaturePage>
  );
}
