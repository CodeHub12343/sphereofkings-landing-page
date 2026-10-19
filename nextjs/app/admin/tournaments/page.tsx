import type { Metadata } from "next";
import Link from "next/link";
import { listTournaments } from "@/lib/db/collections/tournaments";
import TournamentCreateForm from "./TournamentCreateForm";
import AdminControls from "./AdminControls";

export const metadata: Metadata = { title: "Tournaments · Admin · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  const all = await listTournaments();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 24 }}>Tournaments</h1>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Create tournament</h2>
        <TournamentCreateForm />
      </section>

      <section>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>All tournaments</h2>
        {all.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)" }}>None yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse",
                           background: "var(--bg2,#0d0b08)",
                           border: "1px solid var(--border,#2a2218)", borderRadius: 8 }}>
            <thead>
              <tr style={{ background: "var(--bg3,#111009)",
                            color: "var(--text-muted,#a89880)", fontSize: 12,
                            textAlign: "left" }}>
                <th style={th}>Name</th><th style={th}>Game</th><th style={th}>Status</th>
                <th style={th}>Size</th><th style={th}>Starts</th><th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {all.map((t) => (
                <tr key={t.slug} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                  <td style={td}>
                    <Link href={`/tournaments/${t.slug}`} style={{ color: "var(--text,#f5f0e8)" }}>
                      {t.name}
                    </Link>
                  </td>
                  <td style={td}>{t.game.replace("-", " ")}</td>
                  <td style={td}><strong style={{ color: "var(--gold-light,#f0c040)" }}>{t.status}</strong></td>
                  <td style={td}>{t.size}</td>
                  <td style={td}>{new Date(t.startsAt).toLocaleString()}</td>
                  <td style={td}><AdminControls slug={t.slug} status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const th = { padding: "10px 12px", fontWeight: 600 };
const td = { padding: "10px 12px", fontSize: 13, color: "var(--text,#f5f0e8)" };
