import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { enforceTurnTimeout, getMatch } from "@/lib/db/collections/matches";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });

  const parties = [match.challenger.playerId, match.opponent.playerId];
  if (!parties.includes(me.id)) {
    return NextResponse.json({ error: "not a party to this match" }, { status: 403 });
  }
  const current = await enforceTurnTimeout(match);
  return NextResponse.json({ match: current });
}
