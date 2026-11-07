import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import CreationStation from "@/components/sphere/creation-station/CreationStation";
import { getCreation } from "@/lib/db/collections/creation-designs";

export const dynamic = "force-dynamic";

export default async function EditCreationPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  const { id } = await params;
  if (!me) redirect(`/signin?next=/sphere/creation-station/${id}`);
  const c = await getCreation(id);
  if (!c) notFound();
  if (c.playerId !== me.id && !c.isPublic) notFound();

  return (
    <FeaturePage
      compact
      eyebrow="Design · Creation Station"
      title={c.title}
      subtitle="Edit, snapshot, publish, or order this creation."
    >
      <CreationStation initialCreation={{
        id: c.id, title: c.title, grid: c.grid, config: c.config,
        isPublic: c.isPublic, marketplaceVotes: c.marketplaceVotes,
        tags: c.tags, moderationState: c.moderationState, royaltyBps: c.royaltyBps,
      }} />
    </FeaturePage>
  );
}
