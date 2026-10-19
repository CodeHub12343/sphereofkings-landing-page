import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Play Royal Checkers · Sphere of Kings",
  description:
    "Play Royal Checkers against the computer on a 14×8 cylindrical board. Three difficulty tiers. No account needed.",
};

const Board = dynamic(() => import("@/components/game/RoyalCheckersBoard"), {
  ssr: false,
});

export default function PlayRoyalCheckersPage() {
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{
          color: "var(--gold, #c9a227)",
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: "0 0 6px",
        }}>
          Phase 1 · Digital preview
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", color: "var(--text, #f5f0e8)" }}>
          Royal Checkers
        </h1>
        <p style={{ color: "var(--text-muted, #a89880)", maxWidth: 680, marginTop: 10 }}>
          Standard draughts, played on a 14-column cylinder. Columns 14 and 1 are
          neighbours — pieces jump across the seam. Captures are mandatory. First
          to leave the other side without a legal move wins.
        </p>
      </header>
      <Board />
    </main>
  );
}
