import type { Metadata } from "next";
import Link from "next/link";
import { listChampions, REGION_LABELS } from "@/lib/db/collections/tournaments";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FEyebrow } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Champions · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function ChampionsPage() {
  const champions = await listChampions();
  return (
    <FeaturePage
      eyebrow="Hall of Kings"
      title="Champions"
      subtitle={<>Winners of every finished Sphere of Kings tournament. See <Link href="/tournaments" style={{color:"var(--gold-light,#f0c040)"}}>upcoming</Link>.</>}
      centered
    >
      {champions.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          No champions yet — the first tournament hasn't finished.
        </p>
      ) : (
        <FGrid $min="320px">
          {champions.map((t) => (
            <Link key={t.slug} href={`/tournaments/${t.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <FCard style={{ borderColor: "var(--gold,#c9a227)", background: "rgba(201,162,39,.04)" }}>
                <FEyebrow>{t.game.replace("-", " ")} · {REGION_LABELS[t.region] ?? t.region}</FEyebrow>
                <h3>{t.name}</h3>
                <p style={{ color: "var(--text,#f5f0e8)", marginTop: 8 }}>
                  Champion:{" "}
                  <Link href={`/u/${t.championUsername}`} style={{
                    color: "var(--gold-light,#f0c040)", fontFamily: "'Cinzel',serif",
                    fontWeight: 700, textDecoration: "none",
                  }}>
                    {t.championDisplayName}
                  </Link>
                </p>
                <p style={{ fontSize: 12, marginTop: 8 }}>
                  {t.endedAt && new Date(t.endedAt).toLocaleDateString()}
                </p>
              </FCard>
            </Link>
          ))}
        </FGrid>
      )}
    </FeaturePage>
  );
}
