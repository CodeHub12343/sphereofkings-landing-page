import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { getDesign } from "@/lib/db/collections/sphere-designs";
import FeaturePage from "@/components/feature/FeaturePage";
import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderCustomSphere(
  { params }: { params: Promise<{ designId: string }> },
) {
  const { designId } = await params;
  const me = await currentPlayer();
  if (!me) redirect(`/signin?next=/sphere/order/${designId}`);
  const design = await getDesign(designId);
  if (!design) notFound();
  if (design.playerId !== me.id) notFound();

  return (
    <FeaturePage
      eyebrow="Custom physical order"
      title="Order a custom sphere"
      subtitle={<>Design: <strong style={{color:"var(--gold-light,#f0c040)"}}>{design.title}</strong>. Hand-finished. $149 USD plus shipping (calculated at the next step).</>}
      narrow
    >
      {(design.previewBlobKey || design.previewDataUrl) && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={design.previewBlobKey ?? design.previewDataUrl ?? ""} alt="Design preview"
             style={{ width: "100%", maxWidth: 320, borderRadius: 10,
                      border: "1px solid var(--border,#2a2218)", marginBottom: 24,
                      imageRendering: "pixelated" }} />
      )}
      <OrderForm designId={designId} />
    </FeaturePage>
  );
}
