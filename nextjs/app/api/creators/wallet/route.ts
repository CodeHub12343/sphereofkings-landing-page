import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId } from "@/lib/db/collections/creators";
import { ensureCreditIndexes, listEntriesFor, sumBalance } from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ balance: 0, entries: [] });
  await ensureCreditIndexes();
  const [entries, balance] = await Promise.all([
    listEntriesFor(creator.id), sumBalance(creator.id),
  ]);
  return NextResponse.json({ balance, entries });
}
