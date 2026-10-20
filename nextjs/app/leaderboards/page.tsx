import type { Metadata } from "next";
import Link from "next/link";
import { topRankings } from "@/lib/db/collections/players";
import { REGION_LABELS, Region } from "@/lib/db/collections/tournaments";
import { getDb } from "@/lib/db/mongo";
import FeaturePage from "@/components/feature/FeaturePage";
import { FChip } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Leaderboards · Sphere of Kings" };
export const dynamic = "force-dynamic";

interface Props { searchParams: Promise<{ game?: string; region?: string }>; }

const GAMES: Array<{ id: "royal-checkers" | "imperial-kings"; label: string }> = [
  { id: "royal-checkers", label: "Royal Checkers" },
  { id: "imperial-kings", label: "Imperial Kings" },
];

export default async function LeaderboardsPage({ searchParams }: Props) {
  const { game: g, region: r } = await searchParams;
  const game = (g === "imperial-kings" ? "imperial-kings" : "royal-checkers") as "royal-checkers" | "imperial-kings";
  const region = (r as Region) || "global";

  let rows = await topRankings(game, 200);
  if (region !== "global") {
    const db = await getDb();
    const ids = rows.map((row) => row.playerId);
    const regions = await db
      .collection<{ id: string; region?: Region }>("players")
      .find({ id: { $in: ids } }, { projection: { id: 1, region: 1 } })
      .toArray();
    const regionById = new Map(regions.map((p) => [p.id, p.region]));
    rows = rows.filter((row) => regionById.get(row.playerId) === region);
  }
  const db = await getDb();
  const consentMap = new Map(
    (await db.collection<{ id: string; consentStatus?: string; publicProfile?: boolean }>("players")
      .find({ id: { $in: rows.map((r) => r.playerId) } },
            { projection: { id: 1, consentStatus: 1, publicProfile: 1 } }).toArray())
      .map((p) => [p.id, p]),
  );
  rows = rows.filter((row) => {
    if (!row.isMinor) return true;
    const p = consentMap.get(row.playerId);
    return !!p?.publicProfile && p?.consentStatus === "parental-granted";
  });
  rows = rows.slice(0, 50);

  return (
    <FeaturePage
      eyebrow="Phase 5 · Rankings"
      title="Leaderboards"
      subtitle="Top 50 by Glicko-2 rating. Minors are shown only with granted parental consent."
      centered
    >
      <nav style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {GAMES.map((gm) => (
          <Link key={gm.id} href={`/leaderboards?game=${gm.id}&region=${region}`} style={{ textDecoration: "none" }}>
            <FChip $tone={game === gm.id ? "gold" : "muted"}>{gm.label}</FChip>
          </Link>
        ))}
      </nav>
      <nav style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {(Object.keys(REGION_LABELS) as Region[]).map((rg) => (
          <Link key={rg} href={`/leaderboards?game=${game}&region=${rg}`} style={{ textDecoration: "none" }}>
            <FChip $tone={region === rg ? "gold" : "muted"}>{REGION_LABELS[rg]}</FChip>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No ranked players yet.</p>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((row, i) => (
            <li key={row.playerId} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
              padding: "12px 16px",
              background: i < 3 ? "rgba(201,162,39,.06)" : "var(--bg2,#0d0b08)",
              border: `1px solid ${i < 3 ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"}`,
              borderRadius: 6,
            }}>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "'Cinzel',serif",
                                fontSize: 15, color: i < 3 ? "var(--gold-light,#f0c040)" : "var(--text-muted,#a89880)",
                                minWidth: 32, textAlign: "right", fontWeight: 700 }}>
                  #{i + 1}
                </span>
                <Link href={`/u/${row.username}`} style={{ color: "var(--text,#f5f0e8)", textDecoration: "none", fontSize: 15 }}>
                  {row.displayName}
                </Link>
              </span>
              <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Cinzel',serif",
                                color: "var(--gold-light,#f0c040)", fontSize: 20, fontWeight: 700 }}>
                  {row.rating}
                </span>
                <span style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>
                  ±{row.deviation} · {row.wins}W/{row.losses}L
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </FeaturePage>
  );
}
