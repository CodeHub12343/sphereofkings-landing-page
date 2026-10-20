import type { Metadata } from "next";
import FeaturePage from "@/components/feature/FeaturePage";
import Board from "./BoardClient";

export const metadata: Metadata = {
  title: "Play Imperial Kings · Sphere of Kings",
  description:
    "Play Imperial Kings against the computer on a 14×8 cylindrical board. Capture both opposing kings to win.",
};

export default function PlayImperialKingsPage() {
  return (
    <FeaturePage
      eyebrow="Phase 2 · Digital preview"
      title="Imperial Kings"
      subtitle="Chess on a 14-column cylinder with two kings per side. There is no check or checkmate — win by capturing both opposing kings. Rooks, bishops, and queens slide across the seam."
    >
      <Board />
    </FeaturePage>
  );
}
