import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { ensureCreatorIndexes, getCreatorByPlayerId } from "@/lib/db/collections/creators";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/influencers/apply");
  await ensureCreatorIndexes();
  const existing = await getCreatorByPlayerId(me.id);
  if (existing) redirect("/influencers/dashboard");
  return (
    <FeaturePage
      compact
      eyebrow="Creator Kingdom · Apply"
      title="Creator application"
      subtitle="Tell us about your audience. Approved creators can start accepting assignments immediately."
    >
      <ApplyForm />
    </FeaturePage>
  );
}
