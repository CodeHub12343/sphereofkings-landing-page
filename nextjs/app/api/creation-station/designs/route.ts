import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  Creation, defaultConfig, ensureCreationIndexes,
  insertCreation, listCreationsFor,
} from "@/lib/db/collections/creation-designs";
import { emptyGrid, validateGrid } from "@/lib/sphere-grid";
import { moderateText } from "@/lib/creation-station/moderation";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  await ensureCreationIndexes();
  const creations = await listCreationsFor(me.id);
  return NextResponse.json({ creations });
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { title?: string; grid?: unknown; config?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const title = (body.title ?? "Untitled creation").toString().slice(0, 80).trim() || "Untitled creation";
  let grid: string[][];
  try { grid = body.grid ? validateGrid(body.grid) : emptyGrid(); }
  catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "bad grid" }, { status: 400 });
  }

  const config = { ...defaultConfig(), ...(body.config as object | undefined) };

  const moderation = moderateText(
    title, config.personal.name, config.personal.verse,
    config.personal.message, config.checker.engraving, config.checker.symbol,
  );

  await ensureCreationIndexes();
  const id = randomUUID();
  const now = new Date().toISOString();
  const row: Creation = {
    id, playerId: me.id, playerUsername: me.username,
    title, grid, config,
    versions: [{ v: 1, grid, config, snapshotAt: now, reason: "manual" }],
    status: "draft",
    isPublic: false,
    marketplaceVotes: 0,
    marketplaceDownloads: 0,
    royaltyBps: 1000,
    ipFlags: moderation.flags,
    moderationState: moderation.state,
    tags: [],
    createdAt: now, updatedAt: now,
  };
  await insertCreation(row);
  return NextResponse.json({ creation: row });
}
