import "server-only";
import { PlayerProfile, Ranking } from "@/lib/db/collections/players";

// F20 scaffolding — a tiny achievements catalogue + eval function.
// Each achievement has a slug, name, description, and a predicate
// that runs against the player + their rankings after each ranked
// game. Earned slugs are stored on `player.achievements`.

export interface Achievement {
  slug: string;
  name: string;
  description: string;
  predicate: (ctx: { player: PlayerProfile; rankings: Ranking[]; lastResult: Ranking | null }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    slug: "first-win",
    name: "First Victory",
    description: "Win your first ranked game.",
    predicate: ({ rankings }) => rankings.some((r) => r.wins >= 1),
  },
  {
    slug: "five-wins",
    name: "Five on the Board",
    description: "Reach five ranked wins across any mode.",
    predicate: ({ rankings }) => rankings.reduce((s, r) => s + r.wins, 0) >= 5,
  },
  {
    slug: "both-games",
    name: "Two Thrones",
    description: "Play at least one ranked game of each mode.",
    predicate: ({ rankings }) =>
      rankings.some((r) => r.game === "royal-checkers" && r.gamesPlayed > 0) &&
      rankings.some((r) => r.game === "imperial-kings" && r.gamesPlayed > 0),
  },
  {
    slug: "rating-1600",
    name: "Crossing 1600",
    description: "Reach a rating of 1600 or higher in any mode.",
    predicate: ({ rankings }) => rankings.some((r) => r.rating >= 1600),
  },
  {
    slug: "rating-1800",
    name: "Royal Court",
    description: "Reach 1800 in any mode.",
    predicate: ({ rankings }) => rankings.some((r) => r.rating >= 1800),
  },
];

export function evaluateNewAchievements(
  player: PlayerProfile,
  rankings: Ranking[],
  lastResult: Ranking | null,
): string[] {
  const already = new Set(player.achievements ?? []);
  const earned: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (already.has(a.slug)) continue;
    if (a.predicate({ player, rankings, lastResult })) earned.push(a.slug);
  }
  return earned;
}
