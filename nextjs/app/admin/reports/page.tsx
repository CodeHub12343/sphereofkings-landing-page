import type { Metadata } from "next";
import { listReports } from "@/lib/db/collections/safety-io";
import ResolveControls from "./ResolveControls";

export const metadata: Metadata = { title: "Reports · Admin · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const open = await listReports("open");
  const resolved = (await listReports("resolved")).slice(0, 30);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 24 }}>
          Reports <OpenBadge count={open.length} />
        </h1>
      </header>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Open ({open.length})</h2>
        {open.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)" }}>No open reports.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex",
                        flexDirection: "column", gap: 10 }}>
            {open.map((r) => (
              <li key={r.id} style={{
                padding: 14, background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)", borderRadius: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)",
                                  textTransform: "uppercase", letterSpacing: ".08em" }}>
                      {r.subjectKind} · {r.category ?? "no category"}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text,#f5f0e8)", marginTop: 4 }}>
                      <strong>Subject:</strong> <code>{r.subjectId}</code>
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text,#f5f0e8)", marginTop: 4 }}>
                      <strong>Reason:</strong> {r.reason}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", marginTop: 6 }}>
                      Reported by {r.reporterId} · {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <ResolveControls reportId={r.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Recently resolved</h2>
        {resolved.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)" }}>None yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {resolved.map((r) => (
              <li key={r.id} style={{
                padding: "10px 12px", background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                fontSize: 13, color: "var(--text,#f5f0e8)",
              }}>
                <strong style={{ color: "var(--gold-light,#f0c040)" }}>{r.resolution}</strong>
                {" · "}{r.subjectKind} <code>{r.subjectId}</code>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
                  {r.resolutionNote} — resolved {r.resolvedAt && new Date(r.resolvedAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function OpenBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span style={{
      marginLeft: 10, padding: "2px 8px", fontSize: 12, verticalAlign: "middle",
      background: "var(--status-urgent,#ff6b7a)", color: "#000", borderRadius: 10, fontWeight: 700,
    }}>{count}</span>
  );
}
