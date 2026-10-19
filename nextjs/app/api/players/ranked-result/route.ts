import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  GameId, listRankings, ratingForDifficulty, recordRankedResult, updatePlayer,
} from "@/lib/db/collections/players";
import { evaluateNewAchievements } from "@/lib/achievements";

export const runtime = "nodejs";

/**
 * POST body:
 *   { game: "royal-checkers" | "imperial-kings",
 *     result: "win" | "loss" | "draw",
 *     difficulty: number (1..100) }
 *
 * The client reports the outcome; we compute the Glicko-2 update
 * against the AI's synthetic rating. The AI is the only opponent
 * category in Phase 3 — human-vs-human ranked arrives in Phase 4.
 */
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  // Minors with pending consent still *play* ranked, but we don't
  // publish their rating to the leaderboard until consent is granted.
  // We still record it so a resumed-consent flow carries history.

  let body: { game?: GameId; result?: "win" | "loss" | "draw"; difficulty?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (body.game !== "royal-checkers" && body.game !== "imperial-kings") {
    return NextResponse.json({ error: "bad game" }, { status: 400 });
  }
  const resultMap: Record<string, 0 | 0.5 | 1> = { win: 1, draw: 0.5, loss: 0 };
  if (!body.result || !(body.result in resultMap)) {
    return NextResponse.json({ error: "bad result" }, { status: 400 });
  }
  const difficulty = Math.max(1, Math.min(100, Math.round(body.difficulty ?? 50)));

  const opponentRating = ratingForDifficulty(difficulty);
  const updatedRanking = await recordRankedResult({
    playerId: me.id, game: body.game, score: resultMap[body.result], opponentRating,
  });

  // Achievements re-evaluation.
  const allRankings = await listRankings(me.id);
  const newly = evaluateNewAchievements(me, allRankings, updatedRanking);
  if (newly.length > 0) {
    await updatePlayer(me.id, {
      achievements: [...(me.achievements ?? []), ...newly],
    });
  }

  return NextResponse.json({
    ranking: updatedRanking,
    newAchievements: newly,
  });
}
