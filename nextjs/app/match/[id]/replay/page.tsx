import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { getMatch } from "@/lib/db/collections/matches";

export const dynamic = "force-dynamic";

const Replay = nextDynamic(() => import("@/components/game/ReplayViewer"), { ssr: false });

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return { title: "Replay not found" };
  return {
    title: `Replay: ${match.challenger.displayName} vs ${match.opponent.displayName}`,
    description: `${match.game.replace("-", " ")} match replay.`,
  };
}

export default async function MatchReplayPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) notFound();
  if (match.status !== "finished" && match.status !== "abandoned") {
    return (
      <main style={{ padding: "100px 20px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--text,#f5f0e8)" }}>Match still in play</h1>
        <p style={{ color: "var(--text-muted,#a89880)" }}>
          Replays are available after a match ends.{" "}
          <Link href={`/match/${match.id}`} style={{ color: "var(--gold-light,#f0c040)" }}>Open the live match</Link>.
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Replay</p>
      <h1 style={{ margin: "0 0 16px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        {match.challenger.displayName} vs {match.opponent.displayName}
      </h1>
      <Replay match={match} />
    </main>
  );
}
