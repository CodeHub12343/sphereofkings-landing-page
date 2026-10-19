import { EXPERIMENTS } from "@/lib/experiments";
import { summarise } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experiments · Admin" };

export default async function AdminExperimentsPage() {
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const abEvents = await summarise({ since, type: "ab-exposure" });

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 820, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>Experiments</h1>
      <p style={{ color: "var(--text-muted,#a89880)", marginBottom: 20, fontSize: 14 }}>
        Experiments are declared in <code>lib/experiments.ts</code>. Toggle `active`
        and redeploy to pause/resume. Last 7 days exposures: <strong>{abEvents.total}</strong>.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {EXPERIMENTS.map((e) => (
          <li key={e.id} style={{
            padding: 14, background: "var(--bg2,#0d0b08)",
            border: "1px solid var(--border,#2a2218)", borderRadius: 8,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ color: "var(--gold-light,#f0c040)" }}>{e.id}</strong>
              <span style={{ fontSize: 12,
                              color: e.active ? "var(--status-online,#4fb07d)" : "var(--text-muted,#a89880)" }}>
                {e.active ? "active" : "paused"}
              </span>
            </div>
            <p style={{ margin: "6px 0 10px", color: "var(--text-muted,#a89880)", fontSize: 13 }}>
              {e.description}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {e.variants.map((v) => (
                <span key={v.name} style={{
                  padding: "3px 8px", borderRadius: 4, fontSize: 12,
                  background: v.name === e.defaultVariant
                    ? "rgba(201,162,39,.1)" : "var(--bg3,#111009)",
                  color: v.name === e.defaultVariant
                    ? "var(--gold-light,#f0c040)" : "var(--text,#f5f0e8)",
                  border: "1px solid var(--border,#2a2218)",
                }}>{v.name} · {v.weight}%</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
