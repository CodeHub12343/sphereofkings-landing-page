import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listMatchesForPlayer } from "@/lib/db/collections/matches";

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
    <main style={{ padding: "100px 20px 60px", maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 26 }}>Your matches</h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          Challenge someone from their profile — just open any player at <code>/u/username</code>.
        </p>
      </header>

      <Section title="Invites" items={pending} viewerId={me.id} empty="No pending invites." />
      <Section title="Active" items={active} viewerId={me.id} empty="No active matches." />
      <Section title="History" items={finished.slice(0, 20)} viewerId={me.id} empty="No past matches yet." />
    </main>
  );
}

function Section({
  title, items, viewerId, empty,
}: {
  title: string;
  items: Awaited<ReturnType<typeof listMatchesForPlayer>>;
  viewerId: string;
  empty: string;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => {
            const opp = m.challenger.playerId === viewerId ? m.opponent : m.challenger;
            return (
              <Link key={m.id} href={`/match/${m.id}`} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                padding: "12px 14px", background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)", borderRadius: 8,
                color: "var(--text,#f5f0e8)", textDecoration: "none",
              }}>
                <div>
                  <div style={{ fontSize: 15 }}>
                    vs <strong>{opp.displayName}</strong>
                    <span style={{ color: "var(--text-muted,#a89880)", marginLeft: 8, fontSize: 13 }}>
                      {m.game.replace("-", " ")}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", marginTop: 2 }}>
                    {m.status === "finished" && m.winnerId ? (m.winnerId === viewerId ? "You won" : "You lost") :
                      m.status === "finished" && m.outcome === "draw" ? "Draw" :
                      m.status}
                  </div>
                </div>
                <span style={{ color: "var(--gold-light,#f0c040)", fontSize: 14 }}>Open →</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
