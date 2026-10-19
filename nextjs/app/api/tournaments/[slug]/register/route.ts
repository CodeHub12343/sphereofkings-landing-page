import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  entryFor, getTournamentBySlug, listEntries, registerEntry,
  TournamentEntry,
} from "@/lib/db/collections/tournaments";
import { getRanking } from "@/lib/db/collections/players";
import { canRegister, tickTournamentStatus } from "@/lib/tournaments/engine";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let t = await getTournamentBySlug(slug);
  if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });

  t = await tickTournamentStatus(t);

  const blocker = canRegister(t, me);
  if (blocker) return NextResponse.json({ error: blocker }, { status: 409 });

  // Region gating: a non-global tournament requires the player's
  // region to match. Global is open to all.
  if (t.region !== "global" && me.region && me.region !== t.region) {
    return NextResponse.json({ error: "This tournament is region-restricted." }, { status: 409 });
  }

  const existing = await entryFor(slug, me.id);
  if (existing) return NextResponse.json({ error: "already registered" }, { status: 409 });

  const entries = await listEntries(slug);
  if (entries.length >= t.size) {
    return NextResponse.json({ error: "Tournament is full." }, { status: 409 });
  }

  const ranking = await getRanking(me.id, t.game);
  const entry: TournamentEntry = {
    tournamentId: slug,
    playerId: me.id,
    username: me.username,
    displayName: me.displayName,
    region: (me.region ?? "global") as TournamentEntry["region"],
    ratingAtEntry: ranking.rating,
    status: "registered",
    registeredAt: new Date().toISOString(),
  };
  await registerEntry(entry);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const t = await getTournamentBySlug(slug);
  if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (t.status !== "upcoming" && t.status !== "registration") {
    return NextResponse.json({ error: "cannot withdraw after start" }, { status: 409 });
  }
  // Soft-delete the entry.
  const { getDb } = await import("@/lib/db/mongo");
  const db = await getDb();
  await db.collection("tournamentEntries").deleteOne({ tournamentId: slug, playerId: me.id });
  return NextResponse.json({ ok: true });
}
