import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Play Imperial Kings · Sphere of Kings",
  description:
    "Play Imperial Kings against the computer on a 14×8 cylindrical board. Capture both opposing kings to win.",
};

const Board = dynamic(() => import("@/components/game/ImperialKingsBoard"), { ssr: false });

export default function PlayImperialKingsPage() {
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{
          color: "var(--gold,#c9a227)", fontSize: 13,
          letterSpacing: ".12em", textTransform: "uppercase", margin: "0 0 6px",
        }}>Phase 2 · Digital preview</p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,42px)", color: "var(--text,#f5f0e8)" }}>
          Imperial Kings
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)", maxWidth: 680, marginTop: 10 }}>
          Chess on a 14-column cylinder with two kings per side. There is no
          check or checkmate — win by capturing both opposing kings. Rooks,
          bishops, and queens slide across the seam.
        </p>
      </header>
      <Board />
    </main>
  );
}
