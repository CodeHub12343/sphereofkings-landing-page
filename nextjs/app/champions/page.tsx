import type { Metadata } from "next";
import Link from "next/link";
import { listChampions, REGION_LABELS } from "@/lib/db/collections/tournaments";

export const metadata: Metadata = { title: "Champions · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function ChampionsPage() {
  const champions = await listChampions();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>Champions</h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          Winners of every finished Sphere of Kings tournament. See <Link href="/tournaments" style={{ color: "var(--gold-light,#f0c040)" }}>upcoming</Link>.
        </p>
      </header>
      {champions.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No champions yet — the first tournament hasn't finished.</p>
      ) : (
        <div style={{ display: "grid", gap: 10,
                      gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {champions.map((t) => (
            <Link key={t.slug} href={`/tournaments/${t.slug}`} style={{
              display: "block", padding: 16,
              background: "rgba(201,162,39,.06)", border: "1px solid var(--gold,#c9a227)",
              borderRadius: 10, color: "var(--text,#f5f0e8)", textDecoration: "none",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)",
                            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                {t.game.replace("-", " ")} · {REGION_LABELS[t.region] ?? t.region}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontSize: 14 }}>
                Champion:{" "}
                <Link href={`/u/${t.championUsername}`} style={{
                  color: "var(--gold-light,#f0c040)", fontWeight: 700, textDecoration: "none",
                }}>
                  {t.championDisplayName}
                </Link>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", marginTop: 6 }}>
                {t.endedAt && new Date(t.endedAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
