import { notFound, redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import { getDesign } from "@/lib/db/collections/sphere-designs";
import FeaturePage from "@/components/feature/FeaturePage";
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
    <FeaturePage
      eyebrow="Sphere painter · Edit"
      title={`Edit: ${design.title}`}
      subtitle="Changes auto-save when you hit Save. 3D preview updates live."
    >
      <PaintStudio initialGrid={design.grid} initialTitle={design.title} designId={design.id} />
    </FeaturePage>
  );
}
