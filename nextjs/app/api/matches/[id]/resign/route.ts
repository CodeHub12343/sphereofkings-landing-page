import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getMatch, updateMatch } from "@/lib/db/collections/matches";
import { broadcast, matchChannel } from "@/lib/realtime/pusher";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (match.status !== "active") {
    return NextResponse.json({ error: `match is ${match.status}` }, { status: 409 });
  }
  const isChallenger = match.challenger.playerId === me.id;
  const isOpponent = match.opponent.playerId === me.id;
  if (!isChallenger && !isOpponent) {
    return NextResponse.json({ error: "not a party" }, { status: 403 });
  }
  const winner = isChallenger ? match.opponent : match.challenger;
  const now = new Date().toISOString();
  await updateMatch(id, {
    status: "finished",
    endedAt: now,
    outcome: `resigned-by-${me.id}`,
    winnerId: winner.playerId,
    turnExpiresAt: undefined,
  });
  await broadcast(matchChannel(id), "resign", { matchId: id, by: me.id, winnerId: winner.playerId });
  return NextResponse.json({ ok: true });
}
