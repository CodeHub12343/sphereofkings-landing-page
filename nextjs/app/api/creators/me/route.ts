import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  ensureCreatorIndexes, getCreatorByPlayerId, updateCreator,
} from "@/lib/db/collections/creators";
import { sumBalance } from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  await ensureCreatorIndexes();
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ creator: null });
  // Reconcile mirror from ledger before returning, so the dashboard
  // never shows a stale balance after a race.
  const balance = await sumBalance(creator.id);
  if (balance !== creator.creditsBalance) {
    await updateCreator(creator.id, { creditsBalance: balance });
    creator.creditsBalance = balance;
  }
  return NextResponse.json({ creator });
}
