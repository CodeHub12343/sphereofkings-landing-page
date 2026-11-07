import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreation, updateCreation } from "@/lib/db/collections/creation-designs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || c.playerId !== me.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ versions: c.versions ?? [] });
}

// Restore a specific version as the current grid/config.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || c.playerId !== me.id) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => ({})) as { v?: number };
  const v = c.versions?.find((x) => x.v === body.v);
  if (!v) return NextResponse.json({ error: "version not found" }, { status: 404 });
  await updateCreation(id, { grid: v.grid, config: v.config });
  return NextResponse.json({ ok: true });
}
