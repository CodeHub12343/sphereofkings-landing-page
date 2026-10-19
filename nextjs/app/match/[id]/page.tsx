import { redirect, notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { currentPlayer } from "@/lib/auth/player-session";
import { enforceTurnTimeout, getMatch } from "@/lib/db/collections/matches";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MatchBoard = nextDynamic(() => import("@/components/game/MatchBoard"), { ssr: false });

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Match not found" };
  return {
    title: `${match.challenger.displayName} vs ${match.opponent.displayName} · Sphere of Kings`,
  };
}

export default async function MatchPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) redirect(`/signin?next=/match/${id}`);
  const raw = await getMatch(id);
  if (!raw) notFound();
  const parties = [raw.challenger.playerId, raw.opponent.playerId];
  if (!parties.includes(me.id)) {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>Not your match</h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>
          Only the two players can view this match.
        </p>
      </main>
    );
  }
  const match = await enforceTurnTimeout(raw);
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <MatchBoard initial={match} viewerId={me.id} />
    </main>
  );
}
