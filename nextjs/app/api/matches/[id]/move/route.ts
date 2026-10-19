import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  enforceTurnTimeout, getMatch, updateMatch, Match,
} from "@/lib/db/collections/matches";
import { applyServerMove } from "@/lib/realtime/match-engine";
import { broadcast, matchChannel } from "@/lib/realtime/pusher";
import { recordRankedResult, ratingForDifficulty } from "@/lib/db/collections/players";
import { onTournamentMatchFinish } from "@/lib/tournaments/engine";

export const runtime = "nodejs";

const TURN_SECONDS = 120;

/** The authoritative move pipeline. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { moveJson?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!body.moveJson) return NextResponse.json({ error: "moveJson required" }, { status: 400 });

  let match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  const amChallenger = match.challenger.playerId === me.id;
  const amOpponent = match.opponent.playerId === me.id;
  if (!amChallenger && !amOpponent) {
    return NextResponse.json({ error: "not a party" }, { status: 403 });
  }

  // Timeout check — if the current turn has already expired, finalise
  // the match now and refuse the move.
  match = await enforceTurnTimeout(match);
  if (match.status !== "active") {
    return NextResponse.json({ error: `match is ${match.status}` }, { status: 409 });
  }

  const myTurn =
    (amChallenger && match.toMoveSide === "red-or-white") ||
    (amOpponent && match.toMoveSide === "black");
  if (!myTurn) return NextResponse.json({ error: "not your turn" }, { status: 409 });

  let outcome;
  try {
    outcome = applyServerMove(match.game, match.state, body.moveJson);
  } catch {
    return NextResponse.json({ error: "illegal move" }, { status: 400 });
  }

  const now = new Date();
  const patch: Partial<Match> = {
    state: outcome.state,
    toMoveSide: outcome.nextToMove,
    moves: [
      ...match.moves,
      {
        by: me.id,
        json: body.moveJson,
        playedAt: now.toISOString(),
        resultingState: outcome.state,
      },
    ],
    turnExpiresAt: outcome.finished
      ? undefined
      : new Date(now.getTime() + TURN_SECONDS * 1000).toISOString(),
  };

  if (outcome.finished) {
    patch.status = "finished";
    patch.endedAt = now.toISOString();
    if (outcome.winnerSide === "draw") {
      patch.outcome = "draw";
    } else {
      const winnerSide = outcome.winnerSide;
      const winner = winnerSide === "red-or-white" ? match.challenger : match.opponent;
      patch.outcome = winnerSide;
      patch.winnerId = winner.playerId;
    }
  }

  await updateMatch(id, patch);
  const updated = { ...match, ...patch };

  // Ranked update: an opponent is a known-rated human (not AI), so
  // we feed each side's rating into the Glicko-2 update. For MVP we
  // approximate the opponent's rating as 1500 (unknown) and let it
  // converge over play. Phase 5 will join opponent rating via a
  // single read of the rankings collection.
  if (outcome.finished && outcome.winnerSide) {
    const result1 = outcome.winnerSide === "draw"
      ? 0.5
      : outcome.winnerSide === "red-or-white" ? 1 : 0;
    const result2 = outcome.winnerSide === "draw"
      ? 0.5
      : outcome.winnerSide === "red-or-white" ? 0 : 1;
    const synthOpponent = ratingForDifficulty(50); // placeholder: 1500 nominal
    // Record both sides. Failures must not block the match-finish.
    try {
      await recordRankedResult({
        playerId: match.challenger.playerId,
        game: match.game,
        score: result1 as 0 | 0.5 | 1,
        opponentRating: synthOpponent,
      });
      await recordRankedResult({
        playerId: match.opponent.playerId,
        game: match.game,
        score: result2 as 0 | 0.5 | 1,
        opponentRating: synthOpponent,
      });
    } catch (err) {
      console.warn("ranking update failed:", err instanceof Error ? err.message : err);
    }
  }

  // Tournament advancement if this match belongs to one.
  if (outcome.finished &&
      match.tournamentId &&
      typeof match.tournamentRoundIdx === "number" &&
      typeof match.tournamentNodeIdx === "number") {
    const winnerSide = outcome.winnerSide;
    if (winnerSide && winnerSide !== "draw") {
      const winner = winnerSide === "red-or-white" ? match.challenger : match.opponent;
      const loser = winnerSide === "red-or-white" ? match.opponent : match.challenger;
      try {
        await onTournamentMatchFinish({
          tournamentId: match.tournamentId,
          roundIdx: match.tournamentRoundIdx,
          nodeIdx: match.tournamentNodeIdx,
          winnerPlayerId: winner.playerId,
          loserPlayerId: loser.playerId,
        });
      } catch (err) {
        console.warn("tournament advance failed:", err instanceof Error ? err.message : err);
      }
    }
    // On tournament draws (rare — hits only on the 50-move / threefold
    // rules), re-schedule a replay. Phase 6 ADR will decide on an
    // Armageddon tiebreak instead; for Phase 5 we just reset the match.
    if (winnerSide === "draw") {
      await updateMatch(id, {
        status: "active",
        state: outcome.state /* preserve final-position for history */,
      });
    }
  }

  await broadcast(matchChannel(id), "move", {
    matchId: id,
    state: outcome.state,
    toMoveSide: outcome.nextToMove,
    finished: outcome.finished,
    outcome: patch.outcome,
    winnerId: patch.winnerId,
  });

  return NextResponse.json({ match: updated });
}
