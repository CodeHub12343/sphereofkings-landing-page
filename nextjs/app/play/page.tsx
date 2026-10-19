import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Play · Sphere of Kings",
  description: "Play Royal Checkers or Imperial Kings in the browser.",
};

export default function PlayHub() {
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>
          Play now · no account needed
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,42px)", color: "var(--text,#f5f0e8)" }}>
          Choose a game
        </h1>
      </header>

      <div style={{ display: "grid", gap: 16,
                    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
        {[
          { href: "/play/royal-checkers", title: "Royal Checkers", blurb: "14-column cylinder, draughts rules with mandatory captures." },
          { href: "/play/imperial-kings", title: "Imperial Kings", blurb: "Chess variant with two kings per side on the cylinder." },
          { href: "/puzzles", title: "Puzzles", blurb: "Beginner, Easy, Medium, Hard — official puzzle library." },
        ].map((c) => (
          <Link key={c.href} href={c.href} style={{
            display: "block", padding: 20,
            background: "var(--bg2,#0d0b08)",
            border: "1px solid var(--border,#2a2218)",
            borderRadius: 10,
            color: "var(--text,#f5f0e8)",
            textDecoration: "none",
          }}>
            <h2 style={{ margin: "0 0 8px", color: "var(--gold-light,#f0c040)", fontSize: 20 }}>
              {c.title}
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted,#a89880)", fontSize: 14 }}>{c.blurb}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
