import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getMatch, updateMatch } from "@/lib/db/collections/matches";
import { broadcast, matchChannel } from "@/lib/realtime/pusher";

export const runtime = "nodejs";

const TURN_SECONDS = 120;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (match.opponent.playerId !== me.id) {
    return NextResponse.json({ error: "only the invitee can accept" }, { status: 403 });
  }
  if (match.status !== "pending") {
    return NextResponse.json({ error: "match is not pending" }, { status: 409 });
  }
  const now = new Date();
  const turnExpiresAt = new Date(now.getTime() + TURN_SECONDS * 1000).toISOString();
  await updateMatch(id, {
    status: "active",
    acceptedAt: now.toISOString(),
    startedAt: now.toISOString(),
    turnExpiresAt,
  });
  const updated = await getMatch(id);
  await broadcast(matchChannel(id), "match-started", { matchId: id });
  return NextResponse.json({ match: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (match.opponent.playerId !== me.id && match.challenger.playerId !== me.id) {
    return NextResponse.json({ error: "not a party" }, { status: 403 });
  }
  if (match.status !== "pending") {
    return NextResponse.json({ error: "cannot decline after acceptance" }, { status: 409 });
  }
  await updateMatch(id, {
    status: "declined",
    endedAt: new Date().toISOString(),
  });
  await broadcast(matchChannel(id), "match-declined", { matchId: id });
  return NextResponse.json({ ok: true });
}
