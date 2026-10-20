import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import PaintStudio from "./PaintStudio";

export const metadata = { title: "Sphere Painter · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function PaintPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/sphere/paint");
  return (
    <FeaturePage
      eyebrow="Design · Sphere Painter"
      title="Paint your sphere"
      subtitle="Paint the 14×8 play surface. The 3D preview updates live. Save your design, then order a custom physical sphere."
    >
      <PaintStudio />
    </FeaturePage>
  );
}
