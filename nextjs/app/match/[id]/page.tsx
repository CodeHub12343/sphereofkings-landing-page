import { redirect, notFound } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { enforceTurnTimeout, getMatch } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import MatchBoard from "./MatchBoardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match not found" };
  return {
    title: `${match.challenger.displayName} vs ${match.opponent.displayName} · Sphere of Kings`,
  };
}

export default async function MatchPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) redirect(`/signin?next=/match/${id}`);
  const raw = await getMatch(id);
  if (!raw) notFound();
  const parties = [raw.challenger.playerId, raw.opponent.playerId];
  if (!parties.includes(me.id)) {
    return (
      <FeaturePage
        eyebrow="Match"
        title="Not your match"
        subtitle="Only the two players can view this match."
        centered
        narrow
      >
        <div />
      </FeaturePage>
    );
  }
  const match = await enforceTurnTimeout(raw);
  return (
    <FeaturePage
      eyebrow="Live match"
      title={`${match.challenger.displayName} vs ${match.opponent.displayName}`}
      subtitle={`${match.game.replace("-", " ")} · ${match.status}`}
    >
      <MatchBoard initial={match} viewerId={me.id} />
    </FeaturePage>
  );
}
