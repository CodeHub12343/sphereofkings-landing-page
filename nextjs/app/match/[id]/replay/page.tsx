import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatch } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import Replay from "./ReplayClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Replay not found" };
  return {
    title: `Replay: ${match.challenger.displayName} vs ${match.opponent.displayName}`,
    description: `${match.game.replace("-", " ")} match replay.`,
  };
}

export default async function MatchReplayPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();
  if (match.status !== "finished" && match.status !== "abandoned") {
    return (
      <FeaturePage eyebrow="Replay" title="Match still in play"
                   subtitle={<>Replays become available once a match ends. <Link href={`/match/${match.id}`} style={{color:"var(--gold-light,#f0c040)"}}>Open the live match</Link>.</>}
                   centered narrow>
        <div />
      </FeaturePage>
    );
  }
  return (
    <FeaturePage
      eyebrow="Replay"
      title={`${match.challenger.displayName} vs ${match.opponent.displayName}`}
      subtitle={`${match.game.replace("-", " ")} · ${match.moves.length} plies`}
    >
      <Replay match={match} />
    </FeaturePage>
  );
}
