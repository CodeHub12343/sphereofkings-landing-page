import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId } from "@/lib/db/collections/creators";
import { getAssignment, updateAssignment } from "@/lib/db/collections/creator-assignments";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ error: "no creator profile" }, { status: 403 });
  if (creator.state !== "approved")
    return NextResponse.json({ error: "creator not approved" }, { status: 403 });

  const { id } = await params;
  const a = await getAssignment(id);
  if (!a || a.creatorId !== creator.id)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  if (a.status !== "offered")
    return NextResponse.json({ error: `cannot accept assignment in state ${a.status}` }, { status: 400 });

  const body = await req.json().catch(() => ({})) as { agreementVersion?: string };
  const now = new Date().toISOString();
  await updateAssignment(id, {
    status: "active",
    acceptedAt: now,
    agreementAcceptedAt: now,
    agreementVersion: body.agreementVersion ?? a.agreementVersion,
  });
  return NextResponse.json({ ok: true });
}
