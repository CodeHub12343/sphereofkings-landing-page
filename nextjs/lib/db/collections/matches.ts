import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import { GameId } from "./players";

export type MatchStatus =
  | "pending"   // invite sent, awaiting acceptance
  | "active"    // in play
  | "finished"  // ended normally
  | "abandoned" // one side timed out
  | "declined"; // invite rejected or expired

export interface MatchSide {
  playerId: string;
  username: string;
  displayName: string;
}

export interface MatchMove {
  by: string;         // playerId
  json: string;       // engine-specific Move encoded as JSON
  playedAt: string;
  resultingState: string;
}

export interface Match {
  _id?: ObjectId;
  id: string;             // public match id (URL-safe)
  game: GameId;
  status: MatchStatus;
  challenger: MatchSide;  // "red" (RC) / "white" (IK)
  opponent: MatchSide;    // "black"
  // Current engine-encoded state. Server is authoritative — clients
  // may show an optimistic update but must reconcile against this.
  state: string;
  toMoveSide: "red-or-white" | "black";
  moves: MatchMove[];
  invitedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  endedAt?: string;
  // Deadline for the current turn (ISO). Enforced lazily when the
  // next read lands or a move is attempted. Default 2 minutes per
  // turn; configurable per match in Phase 5.
  turnExpiresAt?: string;
  // Set when the match ends. "challenger" / "opponent" / "draw" / "abandoned-by-<id>"
  outcome?: string;
  winnerId?: string;      // the playerId of the winner, if any
  // Tournament attribution — set when a tournament-engine match is
  // scheduled. The match pipeline uses this to call back into the
  // tournament advancer on finish.
  tournamentId?: string;
  tournamentRoundIdx?: number;
  tournamentNodeIdx?: number;
  // In-match chat — ephemeral, capped to the last ~50 messages per
  // match. Only the two players can send; spectators see it read-only.
  chatMessages?: MatchChatMessage[];
}

export interface MatchChatMessage {
  playerId: string;
  displayName: string;
  text: string;
  iso: string;
}

export async function ensureMatchIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<Match>("matches").createIndex({ id: 1 }, { unique: true }),
    db.collection<Match>("matches").createIndex({ "challenger.playerId": 1, status: 1 }),
    db.collection<Match>("matches").createIndex({ "opponent.playerId": 1, status: 1 }),
    db.collection<Match>("matches").createIndex({ status: 1, turnExpiresAt: 1 }),
  ]);
}

export async function insertMatch(m: Match): Promise<void> {
  const db = await getDb();
  await db.collection<Match>("matches").insertOne(m);
}

export async function getMatch(id: string): Promise<Match | null> {
  const db = await getDb();
  return db.collection<Match>("matches").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateMatch(id: string, patch: Partial<Match>): Promise<void> {
  const db = await getDb();
  await db.collection<Match>("matches").updateOne({ id }, { $set: patch });
}

export async function listMatchesForPlayer(playerId: string, status?: MatchStatus): Promise<Match[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {
    $or: [{ "challenger.playerId": playerId }, { "opponent.playerId": playerId }],
  };
  if (status) q.status = status;
  return db
    .collection<Match>("matches")
    .find(q, { projection: { _id: 0 } })
    .sort({ invitedAt: -1 })
    .limit(100)
    .toArray();
}

/**
 * Lazy timeout enforcement: called whenever a player reads or acts
 * on a match. If the current turn has expired, we abandon the match
 * and credit the win to the side NOT on move.
 */
export async function enforceTurnTimeout(match: Match): Promise<Match> {
  if (match.status !== "active") return match;
  if (!match.turnExpiresAt) return match;
  if (new Date(match.turnExpiresAt).getTime() > Date.now()) return match;
  // Timed out. The player NOT on move wins.
  const movingIsChallenger = match.toMoveSide === "red-or-white";
  const winnerSide = movingIsChallenger ? match.opponent : match.challenger;
  const loserSide = movingIsChallenger ? match.challenger : match.opponent;
  const patch: Partial<Match> = {
    status: "abandoned",
    endedAt: new Date().toISOString(),
    outcome: `abandoned-by-${loserSide.playerId}`,
    winnerId: winnerSide.playerId,
  };
  await updateMatch(match.id, patch);
  return { ...match, ...patch };
}
