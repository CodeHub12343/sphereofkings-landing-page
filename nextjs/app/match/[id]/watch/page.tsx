// Spectator view of a live match. Any viewer with the link can
// watch the board update in real time — no sign-in required, no
// click-to-move, no resign.

import { notFound } from "next/navigation";
import { enforceTurnTimeout, getMatch } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import MatchBoard from "../MatchBoardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match not found" };
  return {
    title: `Spectating · ${match.challenger.displayName} vs ${match.opponent.displayName}`,
    robots: { index: false, follow: false },
  };
}

export default async function MatchWatchPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = await getMatch(id);
  if (!raw) notFound();
  const match = await enforceTurnTimeout(raw);
  return (
    <FeaturePage
      eyebrow="Spectator view · live"
      title={`${match.challenger.displayName} vs ${match.opponent.displayName}`}
      subtitle={`${match.game.replace("-", " ")} · ${match.status}`}
    >
      <MatchBoard initial={match} viewerId="spectator" spectator />
    </FeaturePage>
  );
}
