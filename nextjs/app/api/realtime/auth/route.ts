import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getMatch } from "@/lib/db/collections/matches";
import { authResponse, hasPusher } from "@/lib/realtime/pusher";

export const runtime = "nodejs";

/**
 * Pusher auth endpoint for private + presence channels.
 * We validate that the signed-in player is a party to the match the
 * channel refers to before signing the auth response.
 */
export async function POST(req: Request) {
  if (!hasPusher()) {
    return NextResponse.json({ error: "pusher not configured" }, { status: 503 });
  }
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const form = await req.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");
  if (!socketId || !channel) {
    return NextResponse.json({ error: "missing socket_id or channel_name" }, { status: 400 });
  }

  // Channel is "match-<id>" or "presence-match-<id>".
  const matchId = channel.replace(/^presence-/, "").replace(/^match-/, "");
  const match = await getMatch(matchId);
  if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });
  const parties = [match.challenger.playerId, match.opponent.playerId];
  if (!parties.includes(me.id)) {
    return NextResponse.json({ error: "not a party" }, { status: 403 });
  }

  const auth = authResponse(socketId, channel, {
    user_id: me.id,
    user_info: { username: me.username, displayName: me.displayName },
  });
  if (!auth) return NextResponse.json({ error: "auth failed" }, { status: 500 });
  return NextResponse.json({ auth });
}
