import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreation, incrementVote } from "@/lib/db/collections/creation-designs";

export const runtime = "nodejs";

// One signed-in player can +1 or -1 any public creation. The vote tally is
// a simple counter; a dedicated collection would replace this when we care
// about per-player duplicate-vote prevention beyond cookie trust.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || !c.isPublic) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => ({})) as { delta?: number };
  const delta = body.delta === -1 ? -1 : 1;
  await incrementVote(id, delta);
  return NextResponse.json({ ok: true });
}
