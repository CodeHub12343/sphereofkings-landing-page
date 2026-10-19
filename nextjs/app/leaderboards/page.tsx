import type { Metadata } from "next";
import Link from "next/link";
import { topRankings } from "@/lib/db/collections/players";
import { REGION_LABELS, Region } from "@/lib/db/collections/tournaments";
import { getDb } from "@/lib/db/mongo";

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

  // Pull top rankings (all regions), then filter in-app when region != global.
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
  // Hide minors who do not have parental consent; even consented
  // minors stay off the public leaderboard until their own profile
  // is public. See child-safety.md §3 and lib/safety-gates.ts.
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
    <main style={{ padding: "100px 20px 60px", maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 26 }}>Leaderboards</h1>
      </header>
      <nav style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        {GAMES.map((gm) => (
          <Link key={gm.id} href={`/leaderboards?game=${gm.id}&region=${region}`}
                style={chip(game === gm.id)}>{gm.label}</Link>
        ))}
      </nav>
      <nav style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(Object.keys(REGION_LABELS) as Region[]).map((rg) => (
          <Link key={rg} href={`/leaderboards?game=${game}&region=${rg}`} style={chip(region === rg)}>
            {REGION_LABELS[rg]}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No ranked players yet.</p>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((row, i) => (
            <li key={row.playerId} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
              padding: "10px 14px",
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 6,
            }}>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted,#a89880)", minWidth: 28, textAlign: "right" }}>
                  #{i + 1}
                </span>
                <Link href={`/u/${row.username}`} style={{ color: "var(--text,#f5f0e8)", textDecoration: "none" }}>
                  {row.displayName}
                </Link>
              </span>
              <span style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ color: "var(--gold-light,#f0c040)", fontSize: 18, fontWeight: 700 }}>
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
    </main>
  );
}

function chip(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    textDecoration: "none",
    background: active ? "rgba(201,162,39,.1)" : "var(--bg2,#0d0b08)",
    color: active ? "var(--gold-light,#f0c040)" : "var(--text-muted,#a89880)",
    border: `1px solid ${active ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"}`,
  };
}
