import { summarise } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics · Admin" };

export default async function AdminAnalyticsPage() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const all = await summarise({ since });

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 820, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        Analytics · last 30 days
      </h1>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    marginBottom: 24 }}>
        <Stat label="Total events" value={all.total} />
        <Stat label="Pageviews" value={all.byType.pageview ?? 0} />
        <Stat label="Game starts" value={all.byType["game-start"] ?? 0} />
        <Stat label="Game finishes" value={all.byType["game-finish"] ?? 0} />
        <Stat label="Blog views" value={all.byType["blog-view"] ?? 0} />
        <Stat label="Custom orders" value={all.byType["custom-sphere-order"] ?? 0} />
      </div>

      <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>By day</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {Object.keys(all.byDay).sort().reverse().slice(0, 30).map((day) => (
          <li key={day} style={{ display: "flex", justifyContent: "space-between",
                                  padding: "6px 10px",
                                  background: "var(--bg2,#0d0b08)",
                                  border: "1px solid var(--border,#2a2218)",
                                  borderRadius: 5, fontSize: 13 }}>
            <span style={{ color: "var(--text-muted,#a89880)" }}>{day}</span>
            <span style={{ color: "var(--gold-light,#f0c040)", fontWeight: 700 }}>{all.byDay[day]}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: 12, background: "var(--bg2,#0d0b08)",
                   border: "1px solid var(--border,#2a2218)", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)",
                     textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold-light,#f0c040)", marginTop: 4 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
