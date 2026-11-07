import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId } from "@/lib/db/collections/creators";
import {
  ensureAssignmentIndexes, listAssignmentsForCreator,
} from "@/lib/db/collections/creator-assignments";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ assignments: [] });
  await ensureAssignmentIndexes();
  const assignments = await listAssignmentsForCreator(creator.id);
  return NextResponse.json({ assignments });
}
