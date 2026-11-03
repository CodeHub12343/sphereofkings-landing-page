import { redirect, notFound } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { enforceTurnTimeout, getMatch, isOpenSeat } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import JoinInvite from "@/components/game/JoinInvite";
import MatchBoard from "./MatchBoardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match not found" };
  // Link previews (WhatsApp, iMessage…) show this for invite links.
  if (isOpenSeat(match)) {
    return {
      title: `${match.challenger.displayName} invited you to play · Sphere of Kings`,
      description: `Join a live game of ${match.game.replace("-", " ")} in your browser.`,
    };
  }
  return {
    title: `${match.challenger.displayName} vs ${match.opponent.displayName} · Sphere of Kings`,
  };
}

export default async function MatchPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  const raw = await getMatch(id);
  if (!raw) notFound();
  const match = await enforceTurnTimeout(raw);
  const isParty = !!me && (match.challenger.playerId === me.id || match.opponent.playerId === me.id);

  // An invite link opened by anyone other than its creator: offer the
  // seat (or sign-in first). Signed-out visitors land here too, rather
  // than being bounced to sign-in with no context.
  if (!isParty && isOpenSeat(match)) {
    return (
      <FeaturePage eyebrow="Game invite" title="You're invited" narrow>
        <JoinInvite
          matchId={match.id}
          hostName={match.challenger.displayName}
          game={match.game.replace("-", " ")}
          signedIn={!!me}
        />
      </FeaturePage>
    );
  }
  if (!me) redirect(`/signin?next=/match/${id}`);
  if (!isParty) {
    const lapsed = match.openInvite && match.status === "declined";
    return (
      <FeaturePage
        eyebrow="Match"
        title={lapsed ? "Invite no longer available" : "Not your match"}
        subtitle={lapsed
          ? "This invite link was cancelled or has expired. Ask your friend for a new one."
          : match.openInvite
            ? "Someone else already took this seat."
            : "Only the two players can view this match."}
        centered
        narrow
      >
        <div />
      </FeaturePage>
    );
  }
  return (
    <FeaturePage
      eyebrow="Live match"
      title={isOpenSeat(match)
        ? `${match.challenger.displayName} · waiting for a friend`
        : `${match.challenger.displayName} vs ${match.opponent.displayName}`}
      subtitle={`${match.game.replace("-", " ")} · ${match.status}`}
    >
      <MatchBoard initial={match} viewerId={me.id} />
    </FeaturePage>
  );
}
