import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  CreationAsset, ensureCreationAssetIndexes, insertAsset,
} from "@/lib/db/collections/creation-assets";
import { putBlob } from "@/lib/blob";
import { moderateText } from "@/lib/creation-station/moderation";

export const runtime = "nodejs";

const MAX_DATAURL_BYTES = 12_000_000; // ~12 MB raw cap
const EMBED_LIMIT = 60_000;

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: {
    dataUrl?: string;
    dominantColors?: string[];
    width?: number; height?: number;
    rightsStatement?: string;
    sourcePrompt?: string; // optional originating AI prompt for moderation
    kind?: "upload" | "ai-image" | "palette-extraction";
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.dataUrl) return NextResponse.json({ error: "dataUrl required" }, { status: 400 });
  if (body.dataUrl.length > MAX_DATAURL_BYTES)
    return NextResponse.json({ error: "image too large" }, { status: 413 });

  const m = /^data:(image\/(png|jpeg|jpg|webp));base64,(.*)$/.exec(body.dataUrl);
  if (!m) return NextResponse.json({ error: "unsupported image format" }, { status: 400 });
  const mime = m[1];
  const buf = Buffer.from(m[3], "base64");

  const id = randomUUID();
  const asset: CreationAsset = {
    id, playerId: me.id,
    kind: body.kind ?? "upload",
    mime, bytes: buf.length,
    width: body.width, height: body.height,
    dominantColors: Array.isArray(body.dominantColors)
      ? body.dominantColors.filter((c) => typeof c === "string").slice(0, 9)
      : [],
    rightsStatement: (body.rightsStatement ?? "").slice(0, 300),
    moderation: { state: "pending", flags: [] },
    createdAt: new Date().toISOString(),
  };

  if (body.dataUrl.length <= EMBED_LIMIT) {
    asset.dataUrl = body.dataUrl;
  } else {
    const url = await putBlob(`creations/${id}.${mime.split("/")[1]}`, buf, mime);
    if (url) asset.blobKey = url; else asset.dataUrl = body.dataUrl;
  }

  // Text moderation applies to any prompt we received. Image-content
  // moderation would be done by the Python service; we mark pending here.
  const mod = moderateText(body.sourcePrompt, body.rightsStatement);
  asset.moderation = {
    state: mod.state === "clear" ? "clear" : mod.state,
    flags: mod.flags,
  };

  await ensureCreationAssetIndexes();
  await insertAsset(asset);
  return NextResponse.json({ asset });
}
