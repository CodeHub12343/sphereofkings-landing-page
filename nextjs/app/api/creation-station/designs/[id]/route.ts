import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  deleteCreation, getCreation, pushVersion, updateCreation,
} from "@/lib/db/collections/creation-designs";
import { validateGrid } from "@/lib/sphere-grid";
import { moderateText } from "@/lib/creation-station/moderation";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const creation = await getCreation(id);
  if (!creation) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (creation.playerId !== me.id && !creation.isPublic)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ creation });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const existing = await getCreation(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.playerId !== me.id)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: {
    title?: string; grid?: unknown; config?: object;
    previewDataUrl?: string; snapshot?: boolean;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.slice(0, 80);
  let grid = existing.grid;
  if (body.grid !== undefined) {
    try { grid = validateGrid(body.grid); patch.grid = grid; }
    catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "bad grid" }, { status: 400 });
    }
  }
  const config = body.config ? { ...existing.config, ...body.config } : existing.config;
  if (body.config) patch.config = config;
  if (typeof body.previewDataUrl === "string" && body.previewDataUrl.length < 60_000) {
    patch.previewDataUrl = body.previewDataUrl;
  }

  const mod = moderateText(
    (patch.title as string) ?? existing.title,
    config.personal.name, config.personal.verse, config.personal.message,
    config.checker.engraving, config.checker.symbol,
  );
  patch.ipFlags = mod.flags;
  patch.moderationState = mod.state;

  await updateCreation(id, patch);

  if (body.snapshot) {
    await pushVersion(id, {
      v: (existing.versions?.length ?? 0) + 1,
      grid, config,
      snapshotAt: new Date().toISOString(),
      reason: "manual",
    });
  }

  const after = await getCreation(id);
  return NextResponse.json({ creation: after });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteCreation(id, me.id);
  return NextResponse.json({ ok });
}
