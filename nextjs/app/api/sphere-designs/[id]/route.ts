import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  getDesign, updateDesign, validateGrid,
} from "@/lib/db/collections/sphere-designs";

export const runtime = "nodejs";

export async function GET(
  _req: Request, { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const design = await getDesign(id);
  if (!design) return NextResponse.json({ error: "not found" }, { status: 404 });
  // A private design is readable only by its owner.
  if (!design.isPublic) {
    const me = await currentPlayer();
    if (!me || me.id !== design.playerId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }
  return NextResponse.json({ design });
}

export async function PATCH(
  req: Request, { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const design = await getDesign(id);
  if (!design) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (design.playerId !== me.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { title?: string; grid?: unknown; isPublic?: boolean; previewDataUrl?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const patch: Parameters<typeof updateDesign>[1] = {
    updatedAt: new Date().toISOString(),
  };
  if (body.title !== undefined) patch.title = body.title.slice(0, 80).trim() || "Untitled";
  if (body.isPublic !== undefined) patch.isPublic = !!body.isPublic;
  if (body.grid !== undefined) {
    try { patch.grid = validateGrid(body.grid); }
    catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "bad grid" }, { status: 400 }); }
  }
  if (body.previewDataUrl !== undefined && body.previewDataUrl.length <= 40_000) {
    patch.previewDataUrl = body.previewDataUrl;
  }
  await updateDesign(id, patch);
  const updated = await getDesign(id);
  return NextResponse.json({ design: updated });
}
