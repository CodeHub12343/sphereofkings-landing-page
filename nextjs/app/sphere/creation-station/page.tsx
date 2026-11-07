import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import CreationStation from "@/components/sphere/creation-station/CreationStation";

export const metadata = {
  title: "Creation Station · Sphere of Kings",
  description:
    "AI-powered customization portal: design your Sphere of Kings board, pieces, and accessories with nine colors, uploaded art, and AI prompts.",
};
export const dynamic = "force-dynamic";

// Open to anyone — the editor runs client-side and the API routes
// check their own auth. Anonymous users can paint, preview, price, and
// get AI suggestions; the client surfaces a sign-in nudge when they
// try to save, publish, or order.
export default async function CreationStationPage() {
  const me = await currentPlayer();
  return (
    <FeaturePage
      compact
      eyebrow="Design · Creation Station"
      title="Sphere of Kings Creation Station"
      subtitle="Design your board, pieces, lid, and personalizations. Upload artwork or describe your idea — the AI proposes palettes and layouts, the engine keeps every design manufacturable."
    >
      <CreationStation signedIn={!!me} />
    </FeaturePage>
  );
}
