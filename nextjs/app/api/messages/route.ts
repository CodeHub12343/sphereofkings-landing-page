import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import { findPlayerByUsername } from "@/lib/db/collections/players";
import { ensureSafetyIndexes, Message } from "@/lib/db/collections/safety";
import {
  findOrCreateConversation, insertMessage, listConversations,
  updateConversation,
} from "@/lib/db/collections/safety-io";
import { canMessage, minorGateMessage } from "@/lib/safety-gates";
import { moderateText } from "@/lib/moderation";
import { pushNotification } from "@/lib/notifications";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const conversations = await listConversations(me.id);
  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  if (!canMessage(me)) {
    return NextResponse.json({ error: minorGateMessage("send messages") }, { status: 403 });
  }

  let body: { toUsername?: string; body?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (!body.toUsername || !body.body) {
    return NextResponse.json({ error: "toUsername and body required" }, { status: 400 });
  }
  const other = await findPlayerByUsername(body.toUsername);
  if (!other) return NextResponse.json({ error: "recipient not found" }, { status: 404 });
  if (other.id === me.id) {
    return NextResponse.json({ error: "cannot message yourself" }, { status: 400 });
  }
  if (!canMessage(other)) {
    return NextResponse.json(
      { error: "That player cannot receive messages yet." }, { status: 403 },
    );
  }

  const verdict = await moderateText(body.body);
  if (verdict.status === "blocked") {
    return NextResponse.json({ error: `Message blocked: ${verdict.reason}` }, { status: 400 });
  }

  await ensureSafetyIndexes();

  const convo = await findOrCreateConversation({
    initiatorId: me.id, initiatorUsername: me.username, initiatorDisplayName: me.displayName,
    otherId: other.id, otherUsername: other.username, otherDisplayName: other.displayName,
  });

  const now = new Date().toISOString();
  const msg: Message = {
    id: randomUUID(),
    conversationId: convo.id,
    senderId: me.id,
    body: body.body.trim(),
    createdAt: now,
    moderationStatus: verdict.status,
    moderationReason: verdict.status === "flagged" ? verdict.reason : undefined,
    moderationScore: "score" in verdict ? verdict.score : undefined,
  };
  await insertMessage(msg);
  await updateConversation(convo.id, { lastMessageAt: now });

  // Notify the other side (unless muted).
  const muted = (convo.muted as Record<string, boolean>)[other.id];
  if (!muted) {
    await pushNotification({
      recipientId: other.id,
      kind: "message-received",
      payload: { conversationId: convo.id, fromDisplayName: me.displayName, fromUsername: me.username },
    });
  }

  return NextResponse.json({ message: msg, conversationId: convo.id });
}
