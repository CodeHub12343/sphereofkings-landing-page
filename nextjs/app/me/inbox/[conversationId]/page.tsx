import { redirect, notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { currentPlayer } from "@/lib/auth/player-session";
import { getConversation, listMessages, updateConversation } from "@/lib/db/collections/safety-io";

export const dynamic = "force-dynamic";
const Thread = nextDynamic(() => import("./Thread"), { ssr: false });

export default async function ConversationPage(
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const me = await currentPlayer();
  if (!me) redirect(`/signin?next=/me/inbox/${conversationId}`);
  const convo = await getConversation(conversationId);
  if (!convo) notFound();
  if (!convo.participantIds.includes(me.id)) notFound();

  if (convo.status === "pending" && convo.participantIds[1] === me.id) {
    await updateConversation(conversationId, { status: "accepted" });
    convo.status = "accepted";
  }
  const messages = await listMessages(conversationId);
  const otherIdx = convo.participantIds.findIndex((p) => p !== me.id);
  const other = {
    id: convo.participantIds[otherIdx],
    username: convo.participantUsernames[otherIdx],
    displayName: convo.participantDisplayNames[otherIdx],
  };

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 720, margin: "0 auto" }}>
      <Thread
        conversationId={conversationId}
        other={other}
        meId={me.id}
        initialMessages={messages}
      />
    </main>
  );
}
