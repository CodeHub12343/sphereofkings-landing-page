import type { Metadata } from "next";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";

export const metadata: Metadata = {
  title: "Play · Sphere of Kings",
  description: "Play Royal Checkers or Imperial Kings in the browser.",
};

export const dynamic = "force-dynamic";

export default async function PlayHub() {
  const me = await currentPlayer();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <AuthStrip me={me ? { username: me.username, displayName: me.displayName } : null} />
      <header style={{ marginBottom: 32 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>
          Play now
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,42px)", color: "var(--text,#f5f0e8)" }}>
          Choose a game
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)", maxWidth: 680, marginTop: 10 }}>
          {me
            ? "Signed in — your games will update your ranking."
            : "Guest mode is fine. Sign in to track a rating across sessions."}
        </p>
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
            borderRadius: 10, color: "var(--text,#f5f0e8)", textDecoration: "none",
          }}>
            <h2 style={{ margin: "0 0 8px", color: "var(--gold-light,#f0c040)", fontSize: 20 }}>{c.title}</h2>
            <p style={{ margin: 0, color: "var(--text-muted,#a89880)", fontSize: 14 }}>{c.blurb}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function AuthStrip({ me }: { me: { username: string; displayName: string } | null }) {
  const linkStyle = { color: "var(--gold-light,#f0c040)", textDecoration: "none", fontSize: 14 };
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginBottom: 20,
                  color: "var(--text-muted,#a89880)", fontSize: 14 }}>
      {me ? (
        <>
          <Link href="/me" style={linkStyle}>Signed in as {me.displayName}</Link>
        </>
      ) : (
        <>
          <Link href="/signin" style={linkStyle}>Sign in</Link>
          <Link href="/signup" style={linkStyle}>Create account</Link>
        </>
      )}
    </div>
  );
}
