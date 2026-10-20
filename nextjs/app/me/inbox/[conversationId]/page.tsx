import { redirect, notFound } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { getConversation, listMessages, updateConversation } from "@/lib/db/collections/safety-io";
import FeaturePage from "@/components/feature/FeaturePage";
import Thread from "./Thread";

export const dynamic = "force-dynamic";

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
    <FeaturePage
      eyebrow="Direct message"
      title={other.displayName}
      subtitle={`@${other.username}`}
      narrow
    >
      <Thread
        conversationId={conversationId}
        other={other}
        meId={me.id}
        initialMessages={messages}
      />
    </FeaturePage>
  );
}
