import "server-only";
import { cookies } from "next/headers";
import {
  PLAYER_SESSION_COOKIE,
  PLAYER_SESSION_TTL_SECONDS,
  createSessionToken,
  readSessionToken,
} from "./token";
import { findPlayerById, PlayerProfile } from "@/lib/db/collections/players";

export async function setPlayerSession(playerId: string): Promise<void> {
  const token = await createSessionToken({
    kind: "player",
    id: playerId,
    ttlSeconds: PLAYER_SESSION_TTL_SECONDS,
  });
  const jar = await cookies();
  jar.set(PLAYER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PLAYER_SESSION_TTL_SECONDS,
  });
}

export async function clearPlayerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(PLAYER_SESSION_COOKIE);
}

export async function currentPlayer(): Promise<PlayerProfile | null> {
  const jar = await cookies();
  const token = jar.get(PLAYER_SESSION_COOKIE)?.value;
  const payload = await readSessionToken(token, "player");
  if (!payload) return null;
  return findPlayerById(payload.id);
}
