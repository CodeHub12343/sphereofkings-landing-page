import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getPuzzle } from "@/lib/db/collections/puzzles";

const Player = dynamic(() => import("@/components/game/PuzzlePlayer"), { ssr: false });

export const dynamicParams = true;

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
    <main style={{ padding: "100px 20px 60px", maxWidth: 900, margin: "0 auto" }}>
      <Link href="/puzzles" style={{ color: "var(--gold,#c9a227)", textDecoration: "none", fontSize: 14 }}>
        ← All puzzles
      </Link>
      <div style={{ marginTop: 20 }}>
        <Player puzzle={puzzle} />
      </div>
    </main>
  );
}
