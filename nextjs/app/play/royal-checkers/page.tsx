import type { Metadata } from "next";
import FeaturePage from "@/components/feature/FeaturePage";
import Board from "./BoardClient";

export const metadata: Metadata = {
  title: "Play Royal Checkers · Sphere of Kings",
  description:
    "Play Royal Checkers against the computer on a 14×8 cylindrical board. Three difficulty tiers. No account needed.",
};

export default function PlayRoyalCheckersPage() {
  return (
    <FeaturePage
      eyebrow="Phase 1 · Digital preview"
      title="Royal Checkers"
      subtitle="Standard draughts, played on a 14-column cylinder. Columns 14 and 1 are neighbours — pieces jump across the seam. Captures are mandatory. First to leave the other side without a legal move wins."
    >
      <Board />
    </FeaturePage>
  );
}
