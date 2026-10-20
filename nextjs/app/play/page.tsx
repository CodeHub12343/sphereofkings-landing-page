import type { Metadata } from "next";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FEyebrow } from "@/components/feature/primitives";

export const metadata: Metadata = {
  title: "Play · Sphere of Kings",
  description: "Play Royal Checkers or Imperial Kings in the browser.",
};
export const dynamic = "force-dynamic";

const CHOICES = [
  { href: "/play/royal-checkers", eyebrow: "Draughts, with a seam", title: "Royal Checkers",
    blurb: "Standard draughts on a 14-column cylinder. Mandatory captures. Jumps wrap through the seam." },
  { href: "/play/imperial-kings", eyebrow: "Chess, two kings", title: "Imperial Kings",
    blurb: "Capture both opposing kings to win. Rook, bishop, and queen slides wrap across the seam." },
  { href: "/puzzles", eyebrow: "Daily training", title: "Puzzles",
    blurb: "Beginner, Easy, Medium, Hard — our official puzzle library across both games." },
];

export default async function PlayHub() {
  const me = await currentPlayer();
  return (
    <FeaturePage
      eyebrow="Play now · no account needed"
      title="Choose a game"
      subtitle={me
        ? `Signed in as ${me.displayName}. Finished games update your rating.`
        : "Guest mode is fine. Sign in to track a rating across sessions."}
      centered
    >
      <FGrid $min="280px">
        {CHOICES.map((c) => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
            <FCard>
              <FEyebrow>{c.eyebrow}</FEyebrow>
              <h3 style={{ fontSize: "1.35rem", marginTop: 0 }}>{c.title}</h3>
              <p>{c.blurb}</p>
            </FCard>
          </Link>
        ))}
      </FGrid>
      {!me && (
        <p style={{ marginTop: 36, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          <Link href="/signin" style={{ color: "var(--gold-light,#f0c040)" }}>Sign in</Link>
          {"  ·  "}
          <Link href="/signup" style={{ color: "var(--gold-light,#f0c040)" }}>Create account</Link>
        </p>
      )}
    </FeaturePage>
  );
}
