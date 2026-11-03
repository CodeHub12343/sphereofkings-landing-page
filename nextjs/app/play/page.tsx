import type { Metadata } from "next";
import { currentPlayer } from "@/lib/auth/player-session";
import { listMatchesForPlayer, settleExpired } from "@/lib/db/collections/matches";
import { listRankings } from "@/lib/db/collections/players";
import { listPuzzles } from "@/lib/db/collections/puzzles";
import { isIncomingInvite, isMyTurn, puzzleOfTheDay } from "@/lib/app-home";
import PlayHome, { HomeMatch } from "@/components/app/PlayHome";

export const metadata: Metadata = {
  title: "Play · Sphere of Kings",
  description:
    "Play Royal Checkers or Imperial Kings in the browser, solve the daily puzzle, find an online opponent, climb the ranked ladder.",
};
export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const me = await currentPlayer();
  const [rankings, matches, puzzles] = await Promise.all([
    me ? listRankings(me.id) : Promise.resolve([]),
    me ? listMatchesForPlayer(me.id).then(settleExpired) : Promise.resolve([]),
    listPuzzles(),
  ]);

  const toHome = (m: (typeof matches)[number], kind: HomeMatch["kind"]): HomeMatch => {
    const opp = m.challenger.playerId === me!.id ? m.opponent : m.challenger;
    return {
      id: m.id,
      kind,
      game: m.game,
      opponent: opp.displayName,
      turnExpiresAt: m.turnExpiresAt ?? null,
    };
  };
  const yourTurn = me
    ? [
        ...matches.filter((m) => isIncomingInvite(m, me.id)).map((m) => toHome(m, "invite")),
        ...matches.filter((m) => isMyTurn(m, me.id)).map((m) => toHome(m, "your-move")),
      ]
    : [];
  const waiting = me
    ? matches.filter((m) => m.status === "active" && !isMyTurn(m, me.id)).map((m) => toHome(m, "their-move"))
    : [];

  const daily = puzzleOfTheDay(puzzles);
  const rating = (game: "royal-checkers" | "imperial-kings") => {
    const r = rankings.find((x) => x.game === game);
    return r && r.gamesPlayed > 0 ? Math.round(r.rating) : null;
  };

  return (
    <PlayHome
      player={me ? { displayName: me.displayName } : null}
      ratings={{ "royal-checkers": rating("royal-checkers"), "imperial-kings": rating("imperial-kings") }}
      yourTurn={yourTurn}
      waiting={waiting}
      daily={daily ? { slug: daily.slug, title: daily.title, game: daily.game, tier: daily.tier, prompt: daily.prompt } : null}
    />
  );
}
