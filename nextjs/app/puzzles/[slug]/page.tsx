import { notFound } from "next/navigation";
import Link from "next/link";
import { getPuzzle } from "@/lib/db/collections/puzzles";
import FeaturePage from "@/components/feature/FeaturePage";
import { FChip } from "@/components/feature/primitives";
import Player from "./PlayerClient";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const puzzle = await getPuzzle(slug);
  if (!puzzle) return { title: "Puzzle not found" };
  return {
    title: `${puzzle.title} · Puzzles · Sphere of Kings`,
    description: puzzle.prompt,
  };
}

export default async function PuzzleDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const puzzle = await getPuzzle(slug);
  if (!puzzle) notFound();

  return (
    <FeaturePage
      eyebrow={`${puzzle.game === "royal-checkers" ? "Royal Checkers" : "Imperial Kings"} · Puzzle`}
      title={puzzle.title}
      subtitle={puzzle.prompt}
      action={<FChip $tone={puzzle.tier === "kid" ? "info" : "gold"}>{puzzle.tier}</FChip>}
    >
      <Link href="/puzzles" style={{ color: "var(--gold,#c9a227)", textDecoration: "none",
                                      fontSize: 14, display: "inline-block", marginBottom: 20 }}>
        ← All puzzles
      </Link>
      <Player puzzle={puzzle} />
    </FeaturePage>
  );
}
