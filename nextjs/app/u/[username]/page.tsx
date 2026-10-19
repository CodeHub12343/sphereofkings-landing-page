import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPlayerByUsername, listRankings } from "@/lib/db/collections/players";
import nextDynamic from "next/dynamic";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { currentPlayer } from "@/lib/auth/player-session";

const ChallengeButton = nextDynamic(() => import("@/components/game/ChallengeButton"), { ssr: false });
const ReportButton = nextDynamic(() => import("@/components/ReportButton"), { ssr: false });

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> },
): Promise<Metadata> {
  const { username } = await params;
  const player = await findPlayerByUsername(username);
  if (!player) return { title: "Not found · Sphere of Kings" };
  return {
    title: `${player.displayName} (@${player.username}) · Sphere of Kings`,
    description: `Public profile of ${player.displayName}.`,
  };
}

export default async function PublicProfile(
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const player = await findPlayerByUsername(username);
  if (!player) notFound();

  const viewer = await currentPlayer();
  const isSelf = viewer?.id === player.id;

  // Privacy: a non-public profile is viewable only by its owner.
  if (!player.publicProfile && !isSelf) {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)", fontSize: 24 }}>Profile is private</h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          @{player.username} chose to keep their profile private.
        </p>
      </main>
    );
  }

  const rankings = await listRankings(player.id);
  const earned = new Set(player.achievements ?? []);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>
          {player.displayName}
          {/* Child-safety.md: never display a minor badge on a public profile — privacy, not shame. */}
        </h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14, margin: "6px 0 0" }}>
          @{player.username} · joined {new Date(player.createdAt).toLocaleDateString()}
        </p>
        {player.bio && (
          <p style={{ color: "var(--text,#f5f0e8)", fontSize: 15, marginTop: 12 }}>{player.bio}</p>
        )}
        {viewer && !isSelf && (
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ChallengeButton opponentUsername={player.username} opponentDisplayName={player.displayName} />
            <ReportButton subjectKind="profile" subjectId={player.id} label="Report profile" />
          </div>
        )}
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>Ratings</h2>
        {rankings.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>No ranked games yet.</p>
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

      {earned.size > 0 && (
        <section>
          <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>Achievements</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ACHIEVEMENTS.filter((a) => earned.has(a.slug)).map((a) => (
              <div key={a.slug} style={{
                padding: "6px 12px", borderRadius: 20,
                background: "rgba(201,162,39,.08)", border: "1px solid var(--gold,#c9a227)",
                color: "var(--gold-light,#f0c040)", fontSize: 13,
              }}>
                ✓ {a.name}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
