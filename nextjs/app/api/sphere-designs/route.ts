import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  createDesign, emptyGrid, ensureSphereDesignIndexes, listDesignsFor,
  SphereDesign, validateGrid,
} from "@/lib/db/collections/sphere-designs";
import { putBlob } from "@/lib/blob";

export const runtime = "nodejs";

const PREVIEW_EMBED_LIMIT = 40_000;

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const designs = await listDesignsFor(me.id);
  return NextResponse.json({ designs });
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { title?: string; grid?: unknown; previewDataUrl?: string; isPublic?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const title = (body.title ?? "Untitled").toString().slice(0, 80).trim() || "Untitled";
  let grid: string[][];
  try {
    grid = body.grid ? validateGrid(body.grid) : emptyGrid();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "bad grid" }, { status: 400 });
  }

  await ensureSphereDesignIndexes();

  const id = randomUUID();
  const now = new Date().toISOString();
  const row: SphereDesign = {
    id, playerId: me.id, title, grid,
    isPublic: !!body.isPublic,
    createdAt: now, updatedAt: now,
  };

  // Big previews go to Vercel Blob; small ones embed in Mongo.
  if (body.previewDataUrl) {
    if (body.previewDataUrl.length <= PREVIEW_EMBED_LIMIT) {
      row.previewDataUrl = body.previewDataUrl;
    } else {
      const m = /^data:(image\/\w+);base64,(.*)$/.exec(body.previewDataUrl);
      if (m) {
        const buf = Buffer.from(m[2], "base64");
        const url = await putBlob(`sphere/${id}.png`, buf, m[1]);
        if (url) row.previewBlobKey = url;
      }
    }
  }

  await createDesign(row);
  return NextResponse.json({ design: row });
}
