import type { Metadata } from "next";
import Link from "next/link";
import { listPuzzles } from "@/lib/db/collections/puzzles";
import type { Puzzle, PuzzleTier } from "@/lib/games/puzzles/official";

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
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>
          Phase 2 · Puzzles
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,42px)", color: "var(--text,#f5f0e8)" }}>
          Puzzle Library
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)", maxWidth: 680, marginTop: 10 }}>
          No account needed. Solve any puzzle and your run is logged anonymously
          by browser session.
        </p>
      </header>

      {TIER_ORDER.map((tier) => {
        const puzzles = byTier.get(tier) ?? [];
        if (puzzles.length === 0) return null;
        return (
          <section key={tier} style={{ marginBottom: 36 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 20, color: "var(--gold-light,#f0c040)" }}>
              {TIER_LABEL[tier]}
            </h2>
            <div style={{ display: "grid", gap: 12,
                          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
              {puzzles.map((p) => (
                <Link key={p.slug} href={`/puzzles/${p.slug}`} style={{
                  display: "block",
                  padding: 14,
                  background: "var(--bg2,#0d0b08)",
                  border: "1px solid var(--border,#2a2218)",
                  borderRadius: 8,
                  color: "var(--text,#f5f0e8)",
                  textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)",
                                letterSpacing: ".1em", textTransform: "uppercase",
                                marginBottom: 4 }}>
                    {p.game === "royal-checkers" ? "Royal Checkers" : "Imperial Kings"}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted,#a89880)" }}>
                    {p.prompt}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
