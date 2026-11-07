import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { getCreation } from "@/lib/db/collections/creation-designs";
import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  const { id } = await params;
  if (!me) redirect(`/signin?next=/sphere/creation-station/${id}/order`);
  const c = await getCreation(id);
  if (!c) notFound();
  if (c.playerId !== me.id && !c.isPublic) notFound();
  if (c.moderationState === "blocked") {
    return (
      <FeaturePage eyebrow="Creation Station" title="Blocked"
                   subtitle="This creation is blocked by moderation and cannot be ordered.">
        <p style={{ color: "var(--status-urgent,#ff6b7a)" }}>Contact support if you believe this is an error.</p>
      </FeaturePage>
    );
  }
  return (
    <FeaturePage eyebrow="Creation Station · Order"
                 title={`Order "${c.title}"`}
                 subtitle="Confirm shipping, approve the design, and submit for production.">
      <OrderForm creationId={c.id} creationTitle={c.title} />
    </FeaturePage>
  );
}
