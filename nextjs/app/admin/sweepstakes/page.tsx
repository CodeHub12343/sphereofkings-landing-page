import {
  ensureReferralIndexes, listRounds, countVerifiedUnrounded,
} from "@/lib/db/collections/referrals";
import { flag } from "@/lib/feature-flags";
import { getDb } from "@/lib/db/mongo";
import SweepstakesControls from "./SweepstakesControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sweepstakes · Admin" };

export default async function AdminSweepstakesPage() {
  await ensureReferralIndexes().catch(() => {});
  const [rounds, pending, codeCount] = await Promise.all([
    listRounds(),
    countVerifiedUnrounded().catch(() => 0),
    (async () => (await getDb()).collection("referralCodes").countDocuments().catch(() => 0))(),
  ]);
  const enabled = flag("sweepstakesEntries");

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin</p>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        Royal Sphere Giveaway
      </h1>

      <div style={{ display: "grid", gap: 12,
                     gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                     marginBottom: 24 }}>
        <Stat label="Public entries" value={enabled ? "OPEN" : "DARK"}
              tone={enabled ? "ok" : "warn"} />
        <Stat label="Verified entries (unrounded)" value={pending.toLocaleString()} />
        <Stat label="Issued referral codes" value={codeCount.toLocaleString()} />
        <Stat label="Rounds run" value={rounds.filter((r) => r.status !== "collecting").length} />
      </div>

      <SweepstakesControls pending={pending} enabled={enabled} />

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Rounds history</h2>
        {rounds.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No rounds yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {rounds.map((r) => (
              <li key={r.id} style={{ padding: 14,
                   background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                   borderRadius: 8, color: "var(--text,#f5f0e8)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <strong>Round #{r.index} — {r.status}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {new Date(r.startedAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  Prize: {r.prize} · Threshold: {r.threshold} · Qualifiers: {r.qualifierTarget}
                </div>
                {r.winnerPlayerId && (
                  <div style={{ marginTop: 6, color: "var(--gold-light,#f0c040)" }}>
                    Winner: <code>{r.winnerPlayerId}</code>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32, padding: 14,
                        background: "rgba(79,176,125,.06)",
                        border: "1px solid var(--status-online,#4fb07d)",
                        borderRadius: 8, fontSize: 13, color: "var(--text,#f5f0e8)" }}>
        <strong>Entries are OPEN by default</strong> (rules counsel-signed on 2026-10-20, v1.0).
        Kill switch: set <code>FEATURE_SWEEPSTAKES_ENTRIES=0</code> in Vercel to pause the
        public <code>/sweepstakes</code> form between rounds — admin controls stay live.
      </section>
    </main>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "ok" | "warn" }) {
  const color = tone === "ok" ? "var(--status-online,#4fb07d)"
             : tone === "warn" ? "var(--status-waiting,#e0a94a)"
             : "var(--gold-light,#f0c040)";
  return (
    <div style={{ padding: 14, background: "var(--bg2,#0d0b08)",
                   border: "1px solid var(--border,#2a2218)", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
                     letterSpacing: ".1em" }}>{label}</div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 700,
                     color, marginTop: 6 }}>{value}</div>
    </div>
  );
}
