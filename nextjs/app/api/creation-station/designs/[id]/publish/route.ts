import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreation, updateCreation } from "@/lib/db/collections/creation-designs";

export const runtime = "nodejs";

// POST  -> publish (make public on marketplace)
// DELETE -> unpublish
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || c.playerId !== me.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!c.config.rightsConfirmed)
    return NextResponse.json({ error: "rights confirmation required" }, { status: 400 });
  if (c.moderationState === "blocked")
    return NextResponse.json({ error: "design blocked by moderation" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as { tags?: string[]; royaltyBps?: number };
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t) => typeof t === "string").map((t) => t.slice(0, 32)).slice(0, 8)
    : c.tags;
  const royaltyBps = Math.max(0, Math.min(3000, body.royaltyBps ?? c.royaltyBps));

  await updateCreation(id, {
    isPublic: true, publishedAt: new Date().toISOString(),
    tags, royaltyBps,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || c.playerId !== me.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  await updateCreation(id, { isPublic: false });
  return NextResponse.json({ ok: true });
}
