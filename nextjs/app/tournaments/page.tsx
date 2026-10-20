import type { Metadata } from "next";
import Link from "next/link";
import {
  listTournaments, Region, REGION_LABELS, Tournament,
} from "@/lib/db/collections/tournaments";
import { tickTournamentStatus } from "@/lib/tournaments/engine";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FEyebrow, FSectionTitle } from "@/components/feature/primitives";

export const metadata: Metadata = { title: "Tournaments · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const all = await listTournaments();
  const ticked: Tournament[] = [];
  for (const t of all) ticked.push(await tickTournamentStatus(t));

  const open = ticked.filter((t) => t.status === "registration");
  const live = ticked.filter((t) => t.status === "active");
  const upcoming = ticked.filter((t) => t.status === "upcoming");
  const past = ticked.filter((t) => t.status === "finished");

  return (
    <FeaturePage
      eyebrow="Phase 5 · Tournaments"
      title="Tournaments"
      subtitle={<>Free entry. Single-elimination brackets. See <Link href="/champions" style={{color:"var(--gold-light,#f0c040)"}}>champions</Link>.</>}
      centered
    >
      <Section title="Registration open" items={open} />
      <Section title="Live now" items={live} />
      <Section title="Upcoming" items={upcoming} />
      <Section title="Past" items={past.slice(0, 20)} />
    </FeaturePage>
  );
}

function Section({ title, items }: { title: string; items: Tournament[] }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <FSectionTitle>{title}</FSectionTitle>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nothing here right now.</p>
      ) : (
        <FGrid $min="300px">
          {items.map((t) => (
            <Link key={t.slug} href={`/tournaments/${t.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <FCard>
                <FEyebrow>
                  {t.game.replace("-", " ")} · {REGION_LABELS[t.region as Region] ?? t.region} · {t.size}-player
                </FEyebrow>
                <h3>{t.name}</h3>
                <p>Starts {new Date(t.startsAt).toLocaleString()}</p>
              </FCard>
            </Link>
          ))}
        </FGrid>
      )}
    </section>
  );
}
