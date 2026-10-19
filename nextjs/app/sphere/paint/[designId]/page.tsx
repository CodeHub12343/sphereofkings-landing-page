import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { getDesign } from "@/lib/db/collections/sphere-designs";
import PaintStudio from "../PaintStudio";

export const dynamic = "force-dynamic";

export default async function EditDesignPage(
  { params }: { params: Promise<{ designId: string }> },
) {
  const { designId } = await params;
  const me = await currentPlayer();
  if (!me) redirect(`/signin?next=/sphere/paint/${designId}`);
  const design = await getDesign(designId);
  if (!design) notFound();
  if (design.playerId !== me.id) notFound();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        Edit: {design.title}
      </h1>
      <PaintStudio initialGrid={design.grid} initialTitle={design.title} designId={design.id} />
    </main>
  );
}
