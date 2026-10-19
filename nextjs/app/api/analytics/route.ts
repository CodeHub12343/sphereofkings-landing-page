import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { logEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "pageview", "click", "game-start", "game-finish",
  "tournament-register", "blog-view", "custom-sphere-order",
  "web-vitals", "ab-exposure",
]);

export async function POST(req: Request) {
  let body: {
    type?: string;
    path?: string;
    anonymousSessionId?: string;
    payload?: Record<string, string | number | boolean | undefined>;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!body.type || !ALLOWED_TYPES.has(body.type)) {
    return NextResponse.json({ error: "unknown event type" }, { status: 400 });
  }
  const me = await currentPlayer();
  await logEvent({
    type: body.type,
    path: body.path?.slice(0, 300),
    playerId: me?.id,
    anonymousSessionId: body.anonymousSessionId?.slice(0, 64),
    payload: body.payload,
    userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? undefined,
    referrer: req.headers.get("referer")?.slice(0, 300) ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
