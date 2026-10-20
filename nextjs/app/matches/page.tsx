import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listMatchesForPlayer } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import { FSectionTitle, FChip } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Your matches · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/matches");

  const all = await listMatchesForPlayer(me.id);
  const pending = all.filter((m) => m.status === "pending");
  const active = all.filter((m) => m.status === "active");
  const finished = all.filter((m) => m.status === "finished" || m.status === "abandoned" || m.status === "declined");

  return (
    <FeaturePage
      eyebrow="Phase 4 · Multiplayer"
      title="Your matches"
      subtitle={<>Challenge someone from their profile — open any player at <code>/u/username</code>.</>}
    >
      <Section title="Invites" items={pending} viewerId={me.id} empty="No pending invites." />
      <Section title="Active" items={active} viewerId={me.id} empty="No active matches." />
      <Section title="History" items={finished.slice(0, 20)} viewerId={me.id} empty="No past matches yet." />
    </FeaturePage>
  );
}

function Section({ title, items, viewerId, empty }: {
  title: string;
  items: Awaited<ReturnType<typeof listMatchesForPlayer>>;
  viewerId: string;
  empty: string;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <FSectionTitle>{title}</FSectionTitle>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => {
            const opp = m.challenger.playerId === viewerId ? m.opponent : m.challenger;
            return (
              <Link key={m.id} href={`/match/${m.id}`} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                padding: "14px 16px",
                background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)",
                borderRadius: 8,
                color: "var(--text,#f5f0e8)", textDecoration: "none",
              }}>
                <div>
                  <div style={{ fontSize: 15 }}>
                    vs <strong style={{ fontFamily: "'Cinzel',serif", color: "var(--gold-light,#f0c040)" }}>
                      {opp.displayName}
                    </strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: 10, fontSize: 12 }}>
                      {m.game.replace("-", " ")}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <FChip $tone={
                      m.status === "active" ? "success"
                      : m.status === "pending" ? "info"
                      : "muted"
                    }>
                      {m.status === "finished" && m.winnerId
                        ? (m.winnerId === viewerId ? "You won" : "You lost")
                        : m.status === "finished" && m.outcome === "draw" ? "Draw"
                        : m.status}
                    </FChip>
                  </div>
                </div>
                <span style={{ color: "var(--gold-light,#f0c040)", fontFamily: "'Cinzel',serif",
                                 fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  Open →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
