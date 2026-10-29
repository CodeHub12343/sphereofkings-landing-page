import type { Metadata } from "next";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FEyebrow } from "@/components/feature/primitives";

export const metadata: Metadata = {
  title: "Play · Sphere of Kings",
  description:
    "Play Royal Checkers or Imperial Kings in the browser, solve daily puzzles, join tournaments, climb the ranked ladder.",
};
export const dynamic = "force-dynamic";

// Primary playable games.
const GAMES = [
  {
    href: "/play/royal-checkers",
    eyebrow: "Draughts, with a seam",
    title: "Royal Checkers",
    blurb:
      "Standard draughts on a 14-column cylinder. Mandatory captures. Jumps wrap through the seam. Flat board or 3D sphere.",
    cta: "Play Royal Checkers",
  },
  {
    href: "/play/imperial-kings",
    eyebrow: "Chess, two kings",
    title: "Imperial Kings",
    blurb:
      "Capture both opposing kings to win. Rook, bishop, and queen slides wrap across the seam. Flat board or 3D sphere.",
    cta: "Play Imperial Kings",
  },
];

// Modes that extend the two main games.
const MODES = [
  {
    href: "/puzzles",
    eyebrow: "Daily training",
    title: "Puzzles",
    blurb:
      "Beginner → Hard tactical positions across both games. Fresh set every day.",
  },
  {
    href: "/matches",
    eyebrow: "Live multiplayer",
    title: "Online matches",
    blurb:
      "Challenge a friend by link or jump into an open match. Real-time board sync.",
  },
  {
    href: "/tournaments",
    eyebrow: "Bracket play",
    title: "Tournaments",
    blurb:
      "Open brackets with scheduling and seeding. Win rounds to advance toward the title.",
  },
  {
    href: "/champions",
    eyebrow: "Ranked ladder",
    title: "Champions",
    blurb:
      "Glicko-2 rating across both games. Climb the ladder and your name sits with the greats.",
  },
];

export default async function PlayHub() {
  const me = await currentPlayer();
  return (
    <FeaturePage
      eyebrow="Play now · no account needed"
      title="The Sphere of Kings game app"
      subtitle={
        me
          ? `Signed in as ${me.displayName}. Finished games update your rating.`
          : "Guest mode is fine — nothing to install. Sign in to track a rating across sessions."
      }
      centered
    >
      {/* Primary games — large cards side by side */}
      <FGrid $min="320px">
        {GAMES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <FCard
              style={{
                borderColor: "#c9a227",
                boxShadow: "0 0 0 1px rgba(201, 162, 39, 0.25), 0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <FEyebrow>{g.eyebrow}</FEyebrow>
              <h3 style={{ fontSize: "1.5rem", marginTop: 6, color: "#f5f0e8" }}>
                {g.title}
              </h3>
              <p>{g.blurb}</p>
              <span
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#f0c040",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {g.cta} →
              </span>
            </FCard>
          </Link>
        ))}
      </FGrid>

      {/* Modes — four smaller cards */}
      <h2
        style={{
          fontFamily: "'Inter', sans-serif",
          color: "#a89880",
          fontSize: "0.78rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          margin: "40px 0 14px",
          textAlign: "center",
        }}
      >
        Also in the app
      </h2>
      <FGrid $min="240px">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <FCard>
              <FEyebrow>{m.eyebrow}</FEyebrow>
              <h3 style={{ fontSize: "1.2rem", marginTop: 6 }}>{m.title}</h3>
              <p style={{ fontSize: "0.9rem" }}>{m.blurb}</p>
            </FCard>
          </Link>
        ))}
      </FGrid>

      {/* Rules */}
      <p
        style={{
          marginTop: 36,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        New here? Read the{" "}
        <Link href="/how-to-play" style={{ color: "var(--gold-light,#f0c040)" }}>
          how-to-play guide
        </Link>{" "}
        for the sphere-board rules of each game.
      </p>

      {!me && (
        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          <Link href="/signin" style={{ color: "var(--gold-light,#f0c040)" }}>
            Sign in
          </Link>
          {"  ·  "}
          <Link href="/signup" style={{ color: "var(--gold-light,#f0c040)" }}>
            Create account
          </Link>
        </p>
      )}
    </FeaturePage>
  );
}
