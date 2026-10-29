// In-match chat endpoint — append-only ring buffer (last 50 messages)
// stored on the match document. Only the two players can send.
// Anyone with the match URL can read.

import { NextResponse, type NextRequest } from "next/server";
import { getMatch, updateMatch } from "@/lib/db/collections/matches";
import { currentPlayer } from "@/lib/auth/player-session";

export const runtime = "nodejs";

const MAX_MESSAGES = 50;
const MAX_LEN = 240;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not-found" }, { status: 404 });
  return NextResponse.json({ messages: match.chatMessages ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "signed-out" }, { status: 401 });
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not-found" }, { status: 404 });
  // Only match participants can chat.
  if (match.challenger.playerId !== me.id && match.opponent.playerId !== me.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = String(body.text ?? "").trim().slice(0, MAX_LEN);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  const nextMessages = [
    ...(match.chatMessages ?? []),
    {
      playerId: me.id,
      displayName: me.displayName,
      text,
      iso: new Date().toISOString(),
    },
  ].slice(-MAX_MESSAGES);
  await updateMatch(id, { chatMessages: nextMessages });

  // Broadcast via Pusher if configured — reusing the match channel so
  // the opponent sees the new message without needing to poll.
  try {
    const { broadcast, matchChannel } = await import("@/lib/realtime/pusher");
    await broadcast(matchChannel(id), "chat", {
      playerId: me.id,
      displayName: me.displayName,
      text,
      iso: nextMessages[nextMessages.length - 1].iso,
    });
  } catch {
    // Non-fatal — the client falls back to its periodic refetch.
  }

  return NextResponse.json({ ok: true });
}
