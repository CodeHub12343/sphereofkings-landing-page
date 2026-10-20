import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listRankings } from "@/lib/db/collections/players";
import { ACHIEVEMENTS } from "@/lib/achievements";
import MeForm from "./MeForm";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FSectionTitle, FChip } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Your account · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function MePage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin");

  const rankings = await listRankings(me.id);
  const earned = new Set(me.achievements ?? []);

  return (
    <FeaturePage
      eyebrow="Private settings"
      title={me.displayName}
      subtitle={<>@{me.username} · <Link href={`/u/${me.username}`} style={{color:"var(--gold-light,#f0c040)"}}>View public profile</Link></>}
      action={me.isMinor && <FChip $tone="info">Under 18</FChip>}
    >
      <section style={{ marginBottom: 36 }}>
        <FSectionTitle>Ratings</FSectionTitle>
        {rankings.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            No ranked games yet. <Link href="/play" style={{ color: "var(--gold-light,#f0c040)" }}>Play one</Link> to start a rating.
          </p>
        ) : (
          <FGrid $min="220px">
            {rankings.map((r) => (
              <FCard key={r.game}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "var(--text-muted)",
                              textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 6 }}>
                  {r.game.replace("-", " ")}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 32, color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>
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

      <section style={{ marginBottom: 36 }}>
        <FSectionTitle>Achievements</FSectionTitle>
        <FGrid $min="220px">
          {ACHIEVEMENTS.map((a) => {
            const got = earned.has(a.slug);
            return (
              <FCard key={a.slug} style={{
                opacity: got ? 1 : 0.6,
                borderColor: got ? "var(--gold,#c9a227)" : undefined,
                background: got ? "rgba(201,162,39,.06)" : undefined,
              }}>
                <h3 style={{ color: got ? "var(--gold-light,#f0c040)" : "var(--text)" }}>
                  {got ? "✓ " : ""}{a.name}
                </h3>
                <p>{a.description}</p>
              </FCard>
            );
          })}
        </FGrid>
      </section>

      <section>
        <FSectionTitle>Profile</FSectionTitle>
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
    </FeaturePage>
  );
}
