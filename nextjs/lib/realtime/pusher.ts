import "server-only";
import Pusher from "pusher";

// Server-side Pusher wrapper. If the Pusher env vars are not set
// (local dev, preview), we no-op the broadcast and the client falls
// back to polling. This keeps the system functional end-to-end
// without a Pusher account.
//
// Required env (production):
//   PUSHER_APP_ID
//   PUSHER_KEY
//   PUSHER_SECRET
//   PUSHER_CLUSTER      (e.g. "eu")
//   NEXT_PUBLIC_PUSHER_KEY     — mirrored for the browser
//   NEXT_PUBLIC_PUSHER_CLUSTER — mirrored for the browser

let singleton: Pusher | null | undefined;

function client(): Pusher | null {
  if (singleton !== undefined) return singleton;
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) {
    singleton = null;
    return null;
  }
  singleton = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return singleton;
}

export function hasPusher(): boolean {
  return client() !== null;
}

export async function broadcast(
  channel: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const p = client();
  if (!p) return;
  try {
    await p.trigger(channel, event, payload);
  } catch (err) {
    // Broadcast failure must never fail the move itself. The client
    // polls as a fallback, so a dropped push is recoverable.
    console.warn("Pusher broadcast failed:", err instanceof Error ? err.message : err);
  }
}

/** Channel-naming scheme: all match channels use the `match-<id>` prefix. */
export function matchChannel(matchId: string): string {
  return `match-${matchId}`;
}

/**
 * Pusher private + presence channels require this server-side auth
 * endpoint. We expose it at /api/realtime/auth; the client sends the
 * socket_id and channel_name, and we validate the player is a party
 * to the match before signing the response.
 */
export function authResponse(socketId: string, channel: string, playerData: {
  user_id: string;
  user_info: Record<string, unknown>;
}): string | null {
  const p = client();
  if (!p) return null;
  if (channel.startsWith("presence-")) {
    return p.authorizeChannel(socketId, channel, playerData).auth; // typed loosely
  }
  return p.authorizeChannel(socketId, channel).auth;
}
