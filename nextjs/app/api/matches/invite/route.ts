import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  ensureMatchIndexes, insertMatch, listMatchesForPlayer, Match, OPEN_INVITE_TTL_MS, OPEN_SEAT,
} from "@/lib/db/collections/matches";
import type { GameId } from "@/lib/db/collections/players";
import { initialState } from "@/lib/realtime/match-engine";
import { canSendChallenges, minorGateMessage } from "@/lib/safety-gates";

export const runtime = "nodejs";

// Cap on simultaneously open links per player, so one account can't
// flood the matches collection.
const MAX_OPEN_INVITES = 5;

/**
 * Create an open invite. Body: { game }. Returns the match; the share
 * link is /match/<id>. Whoever opens it (signed in) takes the black
 * seat via POST /api/matches/<id>/join.
 */
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { game?: GameId };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (body.game !== "royal-checkers" && body.game !== "imperial-kings") {
    return NextResponse.json({ error: "bad game" }, { status: 400 });
  }
  if (!canSendChallenges(me)) {
    return NextResponse.json({ error: minorGateMessage("invite other players") }, { status: 403 });
  }

  const pending = await listMatchesForPlayer(me.id, "pending");
  const now = Date.now();
  const liveInvites = pending.filter(
    (m) => m.openInvite && m.challenger.playerId === me.id &&
      (!m.inviteExpiresAt || new Date(m.inviteExpiresAt).getTime() > now),
  );
  if (liveInvites.length >= MAX_OPEN_INVITES) {
    return NextResponse.json(
      { error: `You already have ${MAX_OPEN_INVITES} open invite links. Cancel one from Your matches first.` },
      { status: 429 },
    );
  }

  await ensureMatchIndexes();
  const match: Match = {
    id: randomUUID(),
    game: body.game,
    status: "pending",
    challenger: { playerId: me.id, username: me.username, displayName: me.displayName },
    opponent: OPEN_SEAT,
    state: initialState(body.game),
    toMoveSide: "red-or-white",
    moves: [],
    invitedAt: new Date(now).toISOString(),
    openInvite: true,
    inviteExpiresAt: new Date(now + OPEN_INVITE_TTL_MS).toISOString(),
    source: "invite-link",
  };
  await insertMatch(match);
  return NextResponse.json({ match });
}
