import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPlayerByUsername, listRankings } from "@/lib/db/collections/players";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FSectionTitle, FChip } from "@/components/feature/primitives";
import { ChallengeButton, ReportButton } from "./ProfileClient";

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

  if (!player.publicProfile && !isSelf) {
    return (
      <FeaturePage
        eyebrow="Profile"
        title="Profile is private"
        subtitle={`@${player.username} chose to keep their profile private.`}
        centered
        narrow
      >
        <div />
      </FeaturePage>
    );
  }

  const rankings = await listRankings(player.id);
  const earned = new Set(player.achievements ?? []);

  return (
    <FeaturePage
      eyebrow="Public profile"
      title={player.displayName}
      subtitle={`@${player.username} · joined ${new Date(player.createdAt).toLocaleDateString()}`}
      action={viewer && !isSelf ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ChallengeButton opponentUsername={player.username} opponentDisplayName={player.displayName} />
          <ReportButton subjectKind="profile" subjectId={player.id} label="Report profile" />
        </div>
      ) : undefined}
    >
      {player.bio && (
        <p style={{ color: "var(--text,#f5f0e8)", fontSize: 16, lineHeight: 1.7,
                     maxWidth: 760, marginBottom: 32 }}>
          {player.bio}
        </p>
      )}

      <section style={{ marginBottom: 36 }}>
        <FSectionTitle>Ratings</FSectionTitle>
        {rankings.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No ranked games yet.</p>
        ) : (
          <FGrid $min="220px">
            {rankings.map((r) => (
              <FCard key={r.game}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                              color: "var(--text-muted)", textTransform: "uppercase",
                              letterSpacing: ".14em", marginBottom: 6 }}>
                  {r.game.replace("-", " ")}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 32,
                               color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>
                  {r.rating}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  ±{r.deviation} · {r.wins}W / {r.losses}L / {r.draws}D
                </div>
              </FCard>
            ))}
          </FGrid>
        )}
      </section>

      {earned.size > 0 && (
        <section>
          <FSectionTitle>Achievements</FSectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ACHIEVEMENTS.filter((a) => earned.has(a.slug)).map((a) => (
              <FChip key={a.slug}>✓ {a.name}</FChip>
            ))}
          </div>
        </section>
      )}
    </FeaturePage>
  );
}
