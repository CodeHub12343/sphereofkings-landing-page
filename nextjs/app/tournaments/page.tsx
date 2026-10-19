import type { Metadata } from "next";
import Link from "next/link";
import {
  listTournaments, Region, REGION_LABELS, Tournament,
} from "@/lib/db/collections/tournaments";
import { tickTournamentStatus } from "@/lib/tournaments/engine";

export const metadata: Metadata = { title: "Tournaments · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const all = await listTournaments();
  // Lazy state tick on every row so dates roll forward even without QStash.
  const ticked: Tournament[] = [];
  for (const t of all) ticked.push(await tickTournamentStatus(t));

  const upcoming = ticked.filter((t) => t.status === "upcoming");
  const open = ticked.filter((t) => t.status === "registration");
  const live = ticked.filter((t) => t.status === "active");
  const past = ticked.filter((t) => t.status === "finished");

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>Tournaments</h1>
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          Free entry. All brackets are single-elimination. See <Link href="/champions" style={{ color: "var(--gold-light,#f0c040)" }}>champions</Link>.
        </p>
      </header>
      <Section title="Registration open" items={open} />
      <Section title="Live now" items={live} />
      <Section title="Upcoming" items={upcoming} />
      <Section title="Past" items={past.slice(0, 20)} />
    </main>
  );
}

function Section({ title, items }: { title: string; items: Tournament[] }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)", margin: "0 0 10px" }}>{title}</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>Nothing here right now.</p>
      ) : (
        <div style={{ display: "grid", gap: 10,
                      gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {items.map((t) => (
            <Link key={t.slug} href={`/tournaments/${t.slug}`} style={{
              display: "block", padding: 14,
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 8, color: "var(--text,#f5f0e8)", textDecoration: "none",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)",
                            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                {t.game.replace("-", " ")} · {REGION_LABELS[t.region as Region] ?? t.region} · {t.size}-player
              </div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted,#a89880)", marginTop: 6 }}>
                Starts {new Date(t.startsAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
