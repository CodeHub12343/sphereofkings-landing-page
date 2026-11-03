import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { claimOpenInvite, enforceInviteExpiry, getMatch, isOpenSeat } from "@/lib/db/collections/matches";
import { broadcast, matchChannel } from "@/lib/realtime/pusher";
import { pushNotification } from "@/lib/notifications";
import { canSendChallenges, minorGateMessage } from "@/lib/safety-gates";

export const runtime = "nodejs";

/** Take the open seat in an invite-link match and start play. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const raw = await getMatch(id);
  if (!raw) return NextResponse.json({ error: "not found" }, { status: 404 });
  // Re-joining a match you're already seated in is a no-op success,
  // so a double-click or a refresh after joining lands on the board.
  if (raw.opponent.playerId === me.id) return NextResponse.json({ match: raw });
  if (raw.challenger.playerId === me.id) {
    return NextResponse.json({ error: "This is your own invite — send the link to a friend." }, { status: 409 });
  }
  const match = await enforceInviteExpiry(raw);
  if (!isOpenSeat(match)) {
    const reason = match.outcome === "invite-expired"
      ? "This invite link has expired."
      : match.status === "declined"
        ? "This invite was cancelled."
        : "Someone else already took this seat.";
    return NextResponse.json({ error: reason }, { status: 409 });
  }
  if (!canSendChallenges(me)) {
    return NextResponse.json({ error: minorGateMessage("join matches") }, { status: 403 });
  }

  const joined = await claimOpenInvite(id, {
    playerId: me.id, username: me.username, displayName: me.displayName,
  });
  if (!joined) {
    return NextResponse.json({ error: "Someone else already took this seat." }, { status: 409 });
  }
  await broadcast(matchChannel(id), "match-started", { matchId: id });
  await pushNotification({
    recipientId: joined.challenger.playerId,
    kind: "opponent-joined",
    payload: { matchId: id, fromDisplayName: me.displayName },
  });
  return NextResponse.json({ match: joined });
}
