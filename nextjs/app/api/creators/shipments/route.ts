import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId } from "@/lib/db/collections/creators";
import { listRedemptionsFor } from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ shipments: [] });
  const shipments = await listRedemptionsFor(creator.id);
  return NextResponse.json({ shipments });
}
