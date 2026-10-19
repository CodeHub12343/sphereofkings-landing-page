import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { listRankings } from "@/lib/db/collections/players";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ player: null }, { status: 200 });
  const rankings = await listRankings(me.id);
  return NextResponse.json({
    player: {
      id: me.id,
      username: me.username,
      displayName: me.displayName,
      isMinor: me.isMinor,
      publicProfile: me.publicProfile,
    },
    rankings,
  });
}
