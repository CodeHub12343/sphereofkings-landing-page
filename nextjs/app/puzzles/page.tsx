import type { Metadata } from "next";
import Link from "next/link";
import { listPuzzles } from "@/lib/db/collections/puzzles";
import type { Puzzle, PuzzleTier } from "@/lib/games/puzzles/official";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FEyebrow, FSectionTitle, FChip } from "@/components/feature/primitives";

export const metadata: Metadata = {
  title: "Puzzles · Sphere of Kings",
  description: "Official Royal Checkers and Imperial Kings puzzles — three tiers, plus a kid-friendly set.",
};
export const dynamic = "force-dynamic";

const TIER_ORDER: PuzzleTier[] = ["kid", "easy", "medium", "hard"];
const TIER_LABEL: Record<PuzzleTier, string> = {
  kid: "Beginner (kid-friendly)",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default async function PuzzlesPage() {
  const all = await listPuzzles();
  const byTier = new Map<PuzzleTier, Puzzle[]>();
  for (const p of all) {
    const bucket = byTier.get(p.tier) ?? [];
    bucket.push(p);
    byTier.set(p.tier, bucket);
  }
  return (
    <FeaturePage
      eyebrow="Phase 2 · Puzzles"
      title="Puzzle library"
      subtitle="No account needed. Solve any puzzle and your run is logged anonymously by browser session."
      centered
    >
      {TIER_ORDER.map((tier) => {
        const puzzles = byTier.get(tier) ?? [];
        if (puzzles.length === 0) return null;
        return (
          <section key={tier} style={{ marginBottom: 44 }}>
            <FSectionTitle>{TIER_LABEL[tier]}</FSectionTitle>
            <FGrid $min="260px">
              {puzzles.map((p) => (
                <Link key={p.slug} href={`/puzzles/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <FCard>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <FEyebrow style={{ margin: 0 }}>
                        {p.game === "royal-checkers" ? "Royal Checkers" : "Imperial Kings"}
                      </FEyebrow>
                      <FChip $tone={tier === "kid" ? "info" : "gold"}>{tier}</FChip>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.prompt}</p>
                  </FCard>
                </Link>
              ))}
            </FGrid>
          </section>
        );
      })}
    </FeaturePage>
  );
}
