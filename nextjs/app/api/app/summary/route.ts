import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { listMatchesForPlayer, settleExpired } from "@/lib/db/collections/matches";
import { yourTurnCount } from "@/lib/app-home";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight state for the app chrome: who's signed in (avatar) and
 * how many matches are waiting on them (Matches tab badge).
 */
export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ player: null, yourTurn: 0 });
  const matches = await settleExpired(await listMatchesForPlayer(me.id));
  return NextResponse.json(
    {
      player: { username: me.username, displayName: me.displayName },
      yourTurn: yourTurnCount(matches, me.id),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
