import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";
import type { GameId } from "./players";
import { Bracket, TournamentSize } from "@/lib/tournaments/bracket";

export type TournamentStatus =
  | "upcoming"      // not yet open for registration
  | "registration"  // accepting entries
  | "active"        // bracket seeded, matches in play
  | "finished"
  | "cancelled";

export type TournamentFormat = "single-elim";

export type Region =
  | "global" | "na" | "sa" | "eu" | "africa" | "asia" | "oceania";

export const REGIONS: Region[] = ["global", "na", "sa", "eu", "africa", "asia", "oceania"];

export const REGION_LABELS: Record<Region, string> = {
  global: "Global",
  na: "North America",
  sa: "South America",
  eu: "Europe",
  africa: "Africa",
  asia: "Asia",
  oceania: "Oceania",
};

export interface Tournament {
  _id?: ObjectId;
  slug: string;
  name: string;
  game: GameId;
  format: TournamentFormat;
  size: TournamentSize;
  region: Region;
  status: TournamentStatus;
  // Scheduling: all ISO strings — timezone-safe.
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  endedAt?: string;
  description?: string;
  bracket: Bracket | null;
  championPlayerId?: string;
  championUsername?: string;
  championDisplayName?: string;
  createdAt: string;
  createdByAdminId: string;
}

export interface TournamentEntry {
  _id?: ObjectId;
  tournamentId: string; // slug
  playerId: string;
  username: string;
  displayName: string;
  region: Region;
  ratingAtEntry: number;
  seed?: number; // assigned when bracket is drawn
  status: "registered" | "eliminated" | "winner" | "withdrawn";
  registeredAt: string;
}

export async function ensureTournamentIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<Tournament>("tournaments").createIndex({ slug: 1 }, { unique: true }),
    db.collection<Tournament>("tournaments").createIndex({ status: 1, startsAt: 1 }),
    db.collection<Tournament>("tournaments").createIndex({ region: 1, status: 1 }),
    db.collection<TournamentEntry>("tournamentEntries").createIndex({ tournamentId: 1, playerId: 1 }, { unique: true }),
    db.collection<TournamentEntry>("tournamentEntries").createIndex({ playerId: 1 }),
  ]);
}

export async function createTournament(t: Tournament): Promise<void> {
  const db = await getDb();
  await db.collection<Tournament>("tournaments").insertOne(t);
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const db = await getDb();
  return db.collection<Tournament>("tournaments").findOne({ slug }, { projection: { _id: 0 } });
}

export async function listTournaments(filter?: { status?: TournamentStatus; region?: Region }): Promise<Tournament[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (filter?.status) q.status = filter.status;
  if (filter?.region) q.region = filter.region;
  return db
    .collection<Tournament>("tournaments")
    .find(q, { projection: { _id: 0 } })
    .sort({ startsAt: 1 })
    .toArray();
}

export async function updateTournament(slug: string, patch: Partial<Tournament>): Promise<void> {
  const db = await getDb();
  await db.collection<Tournament>("tournaments").updateOne({ slug }, { $set: patch });
}

export async function listChampions(limit = 50): Promise<Tournament[]> {
  const db = await getDb();
  return db
    .collection<Tournament>("tournaments")
    .find({ status: "finished", championPlayerId: { $exists: true } }, { projection: { _id: 0 } })
    .sort({ endedAt: -1 })
    .limit(limit)
    .toArray();
}

/* ----------------------------- Entries ----------------------------- */

export async function registerEntry(e: TournamentEntry): Promise<void> {
  const db = await getDb();
  await db.collection<TournamentEntry>("tournamentEntries").insertOne(e);
}

export async function listEntries(tournamentId: string): Promise<TournamentEntry[]> {
  const db = await getDb();
  return db
    .collection<TournamentEntry>("tournamentEntries")
    .find({ tournamentId }, { projection: { _id: 0 } })
    .toArray();
}

export async function entryFor(tournamentId: string, playerId: string): Promise<TournamentEntry | null> {
  const db = await getDb();
  return db
    .collection<TournamentEntry>("tournamentEntries")
    .findOne({ tournamentId, playerId }, { projection: { _id: 0 } });
}

export async function updateEntry(
  tournamentId: string,
  playerId: string,
  patch: Partial<TournamentEntry>,
): Promise<void> {
  const db = await getDb();
  await db
    .collection<TournamentEntry>("tournamentEntries")
    .updateOne({ tournamentId, playerId }, { $set: patch });
}
