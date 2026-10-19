import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getConversation, listMessages, updateConversation } from "@/lib/db/collections/safety-io";

export const runtime = "nodejs";

export async function GET(
  _req: Request, { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const convo = await getConversation(conversationId);
  if (!convo) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!convo.participantIds.includes(me.id)) {
    return NextResponse.json({ error: "not a participant" }, { status: 403 });
  }
  // Auto-accept on first read by the recipient.
  if (convo.status === "pending" && convo.participantIds[1] === me.id) {
    await updateConversation(conversationId, { status: "accepted" });
    convo.status = "accepted";
  }
  const messages = await listMessages(conversationId);
  return NextResponse.json({ conversation: convo, messages });
}
