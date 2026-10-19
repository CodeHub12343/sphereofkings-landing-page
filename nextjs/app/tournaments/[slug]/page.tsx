import { notFound } from "next/navigation";
import Link from "next/link";
import {
  entryFor, getTournamentBySlug, listEntries, REGION_LABELS,
} from "@/lib/db/collections/tournaments";
import { tickTournamentStatus } from "@/lib/tournaments/engine";
import { currentPlayer } from "@/lib/auth/player-session";
import RegisterButton from "./RegisterButton";
import BracketView from "./BracketView";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const t = await getTournamentBySlug(slug);
  if (!t) return { title: "Not found" };
  return { title: `${t.name} · Sphere of Kings`, description: t.description };
}

export default async function TournamentDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let t = await getTournamentBySlug(slug);
  if (!t) notFound();
  t = await tickTournamentStatus(t);

  const [entries, me] = await Promise.all([listEntries(slug), currentPlayer()]);
  const myEntry = me ? await entryFor(slug, me.id) : null;

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <Link href="/tournaments" style={{ color: "var(--gold,#c9a227)", textDecoration: "none", fontSize: 14 }}>← All tournaments</Link>
      <header style={{ margin: "16px 0 24px" }}>
        <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12,
                      textTransform: "uppercase", letterSpacing: ".1em" }}>
          {t.game.replace("-", " ")} · {REGION_LABELS[t.region] ?? t.region} · {t.size}-player single-elim
        </div>
        <h1 style={{ margin: "6px 0", color: "var(--text,#f5f0e8)", fontSize: 30 }}>{t.name}</h1>
        <div style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          Status: <strong style={{ color: "var(--gold-light,#f0c040)" }}>{t.status}</strong>
          {" · "}Starts {new Date(t.startsAt).toLocaleString()}
        </div>
        {t.description && <p style={{ color: "var(--text,#f5f0e8)", maxWidth: 760, marginTop: 12 }}>{t.description}</p>}
      </header>

      {me && (t.status === "registration" || t.status === "upcoming") && (
        <section style={{ marginBottom: 24 }}>
          <RegisterButton slug={t.slug} alreadyRegistered={!!myEntry} status={t.status} />
        </section>
      )}
      {!me && (t.status === "registration") && (
        <p style={{ color: "var(--text-muted,#a89880)", fontSize: 14 }}>
          <Link href={`/signin?next=/tournaments/${t.slug}`} style={{ color: "var(--gold-light,#f0c040)" }}>Sign in</Link> to register.
        </p>
      )}

      {(t.status === "upcoming" || t.status === "registration") && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)" }}>
            Registered ({entries.length} / {t.size})
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid",
                       gap: 6, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
            {entries.map((e) => (
              <li key={e.playerId} style={{ padding: 8,
                   background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                   borderRadius: 6, fontSize: 14 }}>
                <Link href={`/u/${e.username}`} style={{ color: "var(--text,#f5f0e8)", textDecoration: "none" }}>
                  {e.displayName}
                </Link>
                <span style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginLeft: 6 }}>
                  rating {e.ratingAtEntry}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {t.bracket && (
        <section>
          <h2 style={{ fontSize: 16, color: "var(--gold-light,#f0c040)" }}>Bracket</h2>
          <BracketView bracket={t.bracket} />
        </section>
      )}

      {t.status === "finished" && t.championUsername && (
        <section style={{ marginTop: 24, padding: 20,
             background: "rgba(201,162,39,.08)", border: "1px solid var(--gold,#c9a227)",
             borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)",
                        textTransform: "uppercase", letterSpacing: ".1em" }}>Champion</div>
          <div style={{ fontSize: 22, color: "var(--gold-light,#f0c040)", fontWeight: 700, marginTop: 4 }}>
            <Link href={`/u/${t.championUsername}`} style={{ color: "inherit", textDecoration: "none" }}>
              {t.championDisplayName}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

