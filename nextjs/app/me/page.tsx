import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listRankings } from "@/lib/db/collections/players";
import { ACHIEVEMENTS } from "@/lib/achievements";
import MeForm from "./MeForm";

export const metadata: Metadata = { title: "Your account · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function MePage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin");

  const rankings = await listRankings(me.id);
  const earned = new Set(me.achievements ?? []);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>
          Private settings
        </p>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>
          {me.displayName}
          {me.isMinor && (
            <span style={{ marginLeft: 10, padding: "3px 8px", fontSize: 11,
                           background: "rgba(76,124,224,.2)", color: "var(--minor-badge,#4c7ce0)",
                           borderRadius: 4, letterSpacing: ".1em", verticalAlign: "middle" }}>
              UNDER 18
            </span>
          )}
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14, margin: "6px 0 0" }}>
          @{me.username} · <Link href={`/u/${me.username}`} style={{ color: "var(--gold-light,#f0c040)" }}>
            View public profile
          </Link>
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>Ratings</h2>
        {rankings.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
            No ranked games yet. <Link href="/play" style={{ color: "var(--gold-light,#f0c040)" }}>Play one</Link> to start a rating.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {rankings.map((r) => (
              <div key={r.game} style={{
                padding: 14, background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)", borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", textTransform: "uppercase",
                              letterSpacing: ".08em", marginBottom: 4 }}>
                  {r.game.replace("-", " ")}
                </div>
                <div style={{ fontSize: 28, color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>
                  {r.rating}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted,#a89880)" }}>
                  ±{r.deviation} · {r.wins}W / {r.losses}L / {r.draws}D
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>Achievements</h2>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {ACHIEVEMENTS.map((a) => {
            const got = earned.has(a.slug);
            return (
              <div key={a.slug} style={{
                padding: 12, borderRadius: 8,
                background: got ? "rgba(201,162,39,.08)" : "var(--bg2,#0d0b08)",
                border: `1px solid ${got ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"}`,
                opacity: got ? 1 : 0.65,
              }}>
                <div style={{ fontSize: 14, color: got ? "var(--gold-light,#f0c040)" : "var(--text,#f5f0e8)",
                              fontWeight: 600, marginBottom: 2 }}>
                  {got ? "✓ " : ""}{a.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>{a.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>Profile</h2>
        <MeForm
          initial={{
            displayName: me.displayName,
            bio: me.bio ?? "",
            publicProfile: me.publicProfile,
            isMinor: me.isMinor,
            region: me.region ?? "global",
          }}
        />
      </section>
    </main>
  );
}
