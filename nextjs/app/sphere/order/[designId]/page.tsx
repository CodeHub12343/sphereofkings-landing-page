import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { getDesign } from "@/lib/db/collections/sphere-designs";
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
    <main style={{ padding: "100px 20px 60px", maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 24 }}>Order a custom sphere</h1>
      <p style={{ color: "var(--text-muted,#a89880)", margin: "6px 0 20px" }}>
        Design: <strong style={{ color: "var(--gold-light,#f0c040)" }}>{design.title}</strong>.
        Hand-finished. $149 USD plus shipping (calculated at the next step).
      </p>
      {(design.previewBlobKey || design.previewDataUrl) && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={design.previewBlobKey ?? design.previewDataUrl ?? ""} alt="Design preview"
             style={{ width: 240, borderRadius: 8, border: "1px solid var(--border,#2a2218)", marginBottom: 20 }} />
      )}
      <OrderForm designId={designId} />
    </main>
  );
}
