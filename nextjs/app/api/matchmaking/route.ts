import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { leaveQueue, queueStatus, searchForMatch, searchingCounts } from "@/lib/db/collections/matchmaking";
import type { GameId } from "@/lib/db/collections/players";
import { canSendChallenges, minorGateMessage } from "@/lib/safety-gates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current queue state for the signed-in player + searcher counts. */
export async function GET() {
  const me = await currentPlayer();
  const counts = await searchingCounts();
  if (!me) return NextResponse.json({ status: "idle", counts });
  return NextResponse.json({ ...(await queueStatus(me.id)), counts });
}

/**
 * Join the quick-match queue, or heartbeat an existing search.
 * Body: { game }. The client calls this every few seconds while
 * searching; when it returns status "matched", go to /match/<matchId>.
 */
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { game?: GameId };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (body.game !== "royal-checkers" && body.game !== "imperial-kings") {
    return NextResponse.json({ error: "bad game" }, { status: 400 });
  }
  if (!canSendChallenges(me)) {
    return NextResponse.json({ error: minorGateMessage("play online matches") }, { status: 403 });
  }
  return NextResponse.json(await searchForMatch(me, body.game));
}

/** Leave the queue. */
export async function DELETE() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  return NextResponse.json(await leaveQueue(me.id));
}
