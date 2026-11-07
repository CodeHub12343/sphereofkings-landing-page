import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { ensureCreatorIndexes, getCreatorByPlayerId } from "@/lib/db/collections/creators";
import { ensureAssignmentIndexes, listAssignmentsForCreator } from "@/lib/db/collections/creator-assignments";
import {
  ensureCreditIndexes, listEntriesFor, listRedemptionsFor,
  REWARD_CATALOG, sumBalance,
} from "@/lib/db/collections/creator-credits";
import CreatorDashboard from "./CreatorDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/influencers/dashboard");
  await Promise.all([ensureCreatorIndexes(), ensureAssignmentIndexes(), ensureCreditIndexes()]);
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) {
    return (
      <FeaturePage compact eyebrow="Creator Kingdom" title="Not a creator yet"
                   subtitle="Apply to the Creator Kingdom to unlock assignments, credits, and rewards.">
        <Link href="/influencers/apply" style={{
          background: "var(--gold,#c9a227)", color: "#000", padding: "10px 16px",
          borderRadius: 6, fontWeight: 600, textDecoration: "none", display: "inline-block",
        }}>Apply now →</Link>
      </FeaturePage>
    );
  }
  const [assignments, entries, balance, shipments] = await Promise.all([
    listAssignmentsForCreator(creator.id),
    listEntriesFor(creator.id, 50),
    sumBalance(creator.id),
    listRedemptionsFor(creator.id),
  ]);
  return (
    <FeaturePage compact eyebrow={`Creator · ${creator.tier}`}
                 title={`Welcome, ${creator.displayName}`}
                 subtitle={creator.state === "pending"
                   ? "Your application is under review. You'll be notified when it's approved."
                   : `Balance: ${balance} credits · ${creator.lifetimeProductsEarned} products earned`}>
      <CreatorDashboard
        creator={creator} balance={balance}
        assignments={assignments} entries={entries}
        shipments={shipments} catalog={REWARD_CATALOG}
      />
    </FeaturePage>
  );
}
