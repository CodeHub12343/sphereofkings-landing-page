import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  ensureMatchIndexes, insertMatch, listMatchesForPlayer, Match, MatchStatus,
} from "@/lib/db/collections/matches";
import { findPlayerByUsername, GameId } from "@/lib/db/collections/players";
import { initialState } from "@/lib/realtime/match-engine";
import { broadcast, matchChannel } from "@/lib/realtime/pusher";

export const runtime = "nodejs";

/** List the signed-in player's matches, optionally filtered by status. */
export async function GET(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as MatchStatus | null;
  const matches = await listMatchesForPlayer(me.id, status ?? undefined);
  return NextResponse.json({ matches });
}

/**
 * Challenge another player. Body:
 *   { opponentUsername: string, game: "royal-checkers" | "imperial-kings" }
 * Creates a `pending` match; the opponent must POST /accept to start play.
 */
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { opponentUsername?: string; game?: GameId };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (body.game !== "royal-checkers" && body.game !== "imperial-kings") {
    return NextResponse.json({ error: "bad game" }, { status: 400 });
  }
  if (!body.opponentUsername) {
    return NextResponse.json({ error: "opponent required" }, { status: 400 });
  }
  const opp = await findPlayerByUsername(body.opponentUsername);
  if (!opp) return NextResponse.json({ error: "opponent not found" }, { status: 404 });
  if (opp.id === me.id) {
    return NextResponse.json({ error: "cannot challenge yourself" }, { status: 400 });
  }

  await ensureMatchIndexes();

  const match: Match = {
    id: randomUUID(),
    game: body.game,
    status: "pending",
    challenger: { playerId: me.id, username: me.username, displayName: me.displayName },
    opponent: { playerId: opp.id, username: opp.username, displayName: opp.displayName },
    state: initialState(body.game),
    toMoveSide: "red-or-white",
    moves: [],
    invitedAt: new Date().toISOString(),
  };
  await insertMatch(match);
  await broadcast(matchChannel(match.id), "match-created", { matchId: match.id });
  return NextResponse.json({ match });
}
