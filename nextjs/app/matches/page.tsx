import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { isOpenSeat, listMatchesForPlayer, settleExpired } from "@/lib/db/collections/matches";
import FeaturePage from "@/components/feature/FeaturePage";
import { FSectionTitle, FChip } from "@/components/feature/primitives";
import PlayOnlinePanel from "@/components/game/PlayOnlinePanel";
import ChallengeButton from "@/components/game/ChallengeButton";

export const metadata: Metadata = { title: "Your matches · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/matches");

  const now = Date.now();
  const all = (await settleExpired(await listMatchesForPlayer(me.id))).filter(
    // Lapsed invite links nobody opened are noise in the history.
    (m) => !(isOpenSeat(m) && m.inviteExpiresAt && new Date(m.inviteExpiresAt).getTime() <= now)
      && !(m.openInvite && m.outcome === "invite-expired"),
  );
  const pending = all.filter((m) => m.status === "pending");
  const active = all.filter((m) => m.status === "active");
  const finished = all.filter(
    (m) => (m.status === "finished" || m.status === "abandoned" || m.status === "declined")
      && m.opponent.playerId !== "",
  );

  return (
    <FeaturePage
      eyebrow="Multiplayer"
      title="Your matches"
      subtitle="Find an opponent, invite a friend by link, or challenge anyone from the leaderboard or their profile."
    >
      <PlayOnlinePanel signedIn returnTo="/matches" />
      <Section title="Invites" items={pending} viewerId={me.id} empty="No pending invites." />
      <Section title="Active" items={active} viewerId={me.id} empty="No active matches." />
      <Section title="History" items={finished.slice(0, 20)} viewerId={me.id} empty="No past matches yet." rematch />
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
        Looking for someone to play? <Link href="/leaderboards" style={{ color: "var(--gold-light,#f0c040)" }}>
          Challenge a ranked player
        </Link>.
      </p>
    </FeaturePage>
  );
}

function Section({ title, items, viewerId, empty, rematch = false }: {
  title: string;
  items: Awaited<ReturnType<typeof listMatchesForPlayer>>;
  viewerId: string;
  empty: string;
  rematch?: boolean;
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
            const waitingLink = isOpenSeat(m);
            return (
              <div key={m.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                flexWrap: "wrap",
                padding: "14px 16px",
                background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)",
                borderRadius: 8,
                color: "var(--text,#f5f0e8)",
              }}>
                <Link href={`/match/${m.id}`} style={{ color: "inherit", textDecoration: "none", flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15 }}>
                    {waitingLink ? (
                      <strong style={{ fontFamily: "'Cinzel',serif", color: "var(--gold-light,#f0c040)" }}>
                        Invite link
                      </strong>
                    ) : (
                      <>vs <strong style={{ fontFamily: "'Cinzel',serif", color: "var(--gold-light,#f0c040)" }}>
                        {opp.displayName}
                      </strong></>
                    )}
                    <span style={{ color: "var(--text-muted)", marginLeft: 10, fontSize: 12 }}>
                      {m.game.replace("-", " ")}
                      {m.source === "quick-match" && " · quick match"}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <FChip $tone={
                      m.status === "active" ? "success"
                      : m.status === "pending" ? "info"
                      : "muted"
                    }>
                      {waitingLink ? "waiting for a friend"
                        : m.status === "finished" && m.winnerId
                        ? (m.winnerId === viewerId ? "You won" : "You lost")
                        : m.status === "finished" && m.outcome === "draw" ? "Draw"
                        : m.status}
                    </FChip>
                  </div>
                </Link>
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {rematch && opp.username && (
                    <ChallengeButton
                      opponentUsername={opp.username}
                      opponentDisplayName={opp.displayName}
                      defaultGame={m.game}
                      label="Rematch"
                      compact
                    />
                  )}
                  <Link href={`/match/${m.id}`} style={{
                    color: "var(--gold-light,#f0c040)", fontFamily: "'Cinzel',serif",
                    fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "none",
                  }}>
                    Open →
                  </Link>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
