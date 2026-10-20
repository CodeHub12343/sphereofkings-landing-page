import { notFound } from "next/navigation";
import Link from "next/link";
import {
  entryFor, getTournamentBySlug, listEntries, REGION_LABELS,
} from "@/lib/db/collections/tournaments";
import { tickTournamentStatus } from "@/lib/tournaments/engine";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FSectionTitle, FChip } from "@/components/feature/primitives";
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
    <FeaturePage
      eyebrow={`${t.game.replace("-", " ")} · ${REGION_LABELS[t.region] ?? t.region} · ${t.size}-player single-elim`}
      title={t.name}
      subtitle={<>Status: <FChip $tone={t.status === "active" ? "success" : t.status === "registration" ? "gold" : "muted"}>{t.status}</FChip>{"  "}Starts {new Date(t.startsAt).toLocaleString()}</>}
      action={me && (t.status === "registration" || t.status === "upcoming") ? (
        <RegisterButton slug={t.slug} alreadyRegistered={!!myEntry} status={t.status} />
      ) : undefined}
    >
      <Link href="/tournaments" style={{ color: "var(--gold,#c9a227)", textDecoration: "none",
                                         fontSize: 14, display: "inline-block", marginBottom: 20 }}>
        ← All tournaments
      </Link>

      {t.description && (
        <p style={{ color: "var(--text,#f5f0e8)", maxWidth: 760, fontSize: 15,
                    lineHeight: 1.7, marginBottom: 32 }}>
          {t.description}
        </p>
      )}

      {!me && (t.status === "registration") && (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          <Link href={`/signin?next=/tournaments/${t.slug}`} style={{ color: "var(--gold-light,#f0c040)" }}>
            Sign in
          </Link> to register.
        </p>
      )}

      {(t.status === "upcoming" || t.status === "registration") && (
        <section style={{ marginBottom: 36 }}>
          <FSectionTitle>Registered ({entries.length} / {t.size})</FSectionTitle>
          {entries.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>Be the first to register.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid",
                         gap: 8, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
              {entries.map((e) => (
                <li key={e.playerId} style={{ padding: "10px 12px",
                     background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                     borderRadius: 6, fontSize: 14 }}>
                  <Link href={`/u/${e.username}`} style={{ color: "var(--text,#f5f0e8)", textDecoration: "none" }}>
                    {e.displayName}
                  </Link>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 6 }}>
                    rating {e.ratingAtEntry}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {t.bracket && (
        <section style={{ marginBottom: 36 }}>
          <FSectionTitle>Bracket</FSectionTitle>
          <BracketView bracket={t.bracket} />
        </section>
      )}

      {t.status === "finished" && t.championUsername && (
        <FCard style={{ borderColor: "var(--gold,#c9a227)",
                         background: "rgba(201,162,39,.06)", padding: 24 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11,
                        color: "var(--text-muted)", textTransform: "uppercase",
                        letterSpacing: ".14em" }}>Champion</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26,
                         color: "var(--gold-light,#f0c040)", fontWeight: 700, marginTop: 4 }}>
            <Link href={`/u/${t.championUsername}`} style={{ color: "inherit", textDecoration: "none" }}>
              {t.championDisplayName}
            </Link>
          </div>
        </FCard>
      )}
    </FeaturePage>
  );
}
