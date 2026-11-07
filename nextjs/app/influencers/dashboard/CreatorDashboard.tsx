"use client";

import { useMemo, useState } from "react";
import type { Creator } from "@/lib/db/collections/creators";
import type { Assignment } from "@/lib/db/collections/creator-assignments";
import type { CreditEntry, Redemption, RewardProduct } from "@/lib/db/collections/creator-credits";

type Tab = "overview" | "assignments" | "submit" | "wallet" | "rewards" | "shipping" | "referral" | "profile";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "assignments", label: "Assignments" },
  { id: "submit", label: "Submit post" },
  { id: "wallet", label: "Wallet" },
  { id: "rewards", label: "Rewards" },
  { id: "shipping", label: "Shipping" },
  { id: "referral", label: "Referral" },
  { id: "profile", label: "Profile" },
];

export default function CreatorDashboard({
  creator, balance, assignments: initialAssignments, entries, shipments: initialShipments, catalog,
}: {
  creator: Creator; balance: number; assignments: Assignment[];
  entries: CreditEntry[]; shipments: Redemption[]; catalog: RewardProduct[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [bal, setBal] = useState(balance);
  const [shipments, setShipments] = useState(initialShipments);

  const activeAssignment = assignments.find((a) => a.status === "active" || a.status === "under-review");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {creator.state !== "approved" && (
        <Banner level={creator.state === "rejected" || creator.state === "suspended" ? "red" : "gold"}>
          Account state: <strong>{creator.state}</strong> — contact support if you have questions.
        </Banner>
      )}

      <Tabs tabs={TABS} tab={tab} onTab={setTab} />

      {tab === "overview" && <Overview creator={creator} balance={bal} assignments={assignments} />}
      {tab === "assignments" && (
        <AssignmentsPanel
          assignments={assignments}
          onAccept={async (id) => {
            const res = await fetch(`/api/creators/assignments/${id}/accept`, { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
            if (res.ok) {
              const next = await (await fetch("/api/creators/assignments")).json();
              setAssignments(next.assignments);
            }
          }}
        />
      )}
      {tab === "submit" && (
        <SubmitPanel
          assignments={assignments}
          onSubmitted={async () => {
            const next = await (await fetch("/api/creators/assignments")).json();
            setAssignments(next.assignments);
          }}
        />
      )}
      {tab === "wallet" && <WalletPanel balance={bal} entries={entries} />}
      {tab === "rewards" && (
        <RewardsPanel
          catalog={catalog} balance={bal}
          onRedeemed={async () => {
            const w = await (await fetch("/api/creators/wallet")).json();
            setBal(w.balance);
            const s = await (await fetch("/api/creators/shipments")).json();
            setShipments(s.shipments);
            setTab("shipping");
          }}
        />
      )}
      {tab === "shipping" && <ShippingPanel shipments={shipments} />}
      {tab === "referral" && <ReferralPanel creator={creator} />}
      {tab === "profile" && <ProfilePanel creator={creator} />}
    </div>
  );
}

// ---------- Panels ----------

function Overview({ creator, balance, assignments }: { creator: Creator; balance: number; assignments: Assignment[] }) {
  const active = assignments.find((a) => a.status === "active" || a.status === "under-review");
  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
      <Stat label="Credits" value={balance.toLocaleString()} sub={`${creator.tier}`} />
      <Stat label="Products earned" value={creator.lifetimeProductsEarned.toString()} />
      <Stat label="Posts approved" value={creator.lifetimePostsApproved.toString()} />
      <Stat label="Referral clicks" value={creator.referralClicks.toString()}
            sub={`${creator.referralConversions} conversions`} />
      {active ? (
        <div style={{ gridColumn: "1 / -1", background: "var(--bg2,#0d0b08)",
                      border: "1px solid var(--border,#2a2218)", borderRadius: 10, padding: 14 }}>
          <strong style={{ color: "var(--gold-light,#f0c040)" }}>Current: {active.campaignName}</strong>
          <ProgressBar label="Original videos" now={active.approvedOriginalVideos} max={active.originalVideosRequired} />
          <ProgressBar label="Social posts" now={active.approvedPosts} max={active.totalPostsRequired} />
          <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginTop: 6 }}>
            Reward: {active.creditsOnCompletion} credits on completion
            {active.dueAt && ` · due ${new Date(active.dueAt).toLocaleDateString()}`}
          </div>
        </div>
      ) : (
        <div style={{ gridColumn: "1 / -1", color: "var(--text-muted,#a89880)", fontSize: 13 }}>
          No active assignment. Check the Assignments tab for offers.
        </div>
      )}
    </div>
  );
}

function AssignmentsPanel({ assignments, onAccept }: { assignments: Assignment[]; onAccept: (id: string) => void }) {
  if (assignments.length === 0) return <Empty text="No assignments yet. An admin will offer you one when a campaign is ready." />;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
      {assignments.map((a) => (
        <li key={a.id} style={{
          background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
          borderRadius: 10, padding: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <strong style={{ color: "var(--gold-light,#f0c040)" }}>{a.campaignName}</strong>
            <span style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>
              {a.status} · {a.originalVideosRequired} videos / {a.totalPostsRequired} posts
            </span>
          </div>
          <ProgressBar label="Videos" now={a.approvedOriginalVideos} max={a.originalVideosRequired} />
          <ProgressBar label="Posts" now={a.approvedPosts} max={a.totalPostsRequired} />
          {a.status === "offered" && (
            <button onClick={() => onAccept(a.id)}
                    style={{ marginTop: 8, background: "var(--gold,#c9a227)", color: "#000",
                             border: "none", borderRadius: 6, padding: "6px 12px",
                             fontWeight: 600, cursor: "pointer" }}>
              Accept assignment
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function SubmitPanel({ assignments, onSubmitted }: { assignments: Assignment[]; onSubmitted: () => void }) {
  const active = assignments.filter((a) => a.status === "active" || a.status === "under-review");
  const [assignmentId, setAssignmentId] = useState(active[0]?.id ?? "");
  const [videoId, setVideoId] = useState("");
  const [url, setUrl] = useState("");
  const [disclosure, setDisclosure] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = useMemo(() => active.find((a) => a.id === assignmentId), [active, assignmentId]);

  const submit = async () => {
    setErr(null); setOk(null);
    if (!assignmentId || !videoId || !url) return setErr("Pick an assignment, video, and paste the URL.");
    if (!disclosure) return setErr("Confirm the post includes sponsored-content disclosure.");
    setBusy(true);
    try {
      const res = await fetch("/api/creators/posts", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ assignmentId, originalVideoId: videoId, url, disclosureVerified: true }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Submit failed."); return; }
      setOk("Submitted — awaiting admin review.");
      setUrl("");
      onSubmitted();
    } finally { setBusy(false); }
  };

  if (active.length === 0) return <Empty text="No active assignment to submit against." />;

  const input: React.CSSProperties = {
    background: "#000", color: "var(--text,#f5f0e8)",
    border: "1px solid var(--border,#2a2218)", borderRadius: 6,
    padding: "8px 10px", fontSize: 13, width: "100%",
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Assignment
        <select value={assignmentId} onChange={(e) => { setAssignmentId(e.target.value); setVideoId(""); }} style={input}>
          {active.map((a) => <option key={a.id} value={a.id}>{a.campaignName}</option>)}
        </select>
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Original video (this placement is for)
        <select value={videoId} onChange={(e) => setVideoId(e.target.value)} style={input}>
          <option value="">Pick one…</option>
          {current?.originalVideos.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
        </select>
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Published post URL
        <input value={url} onChange={(e) => setUrl(e.target.value)}
               placeholder="https://www.tiktok.com/@you/video/..." style={input} />
      </label>
      <label style={{ fontSize: 13, color: "var(--text,#f5f0e8)", display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={disclosure} onChange={(e) => setDisclosure(e.target.checked)} />
        Post includes the required #ad / sponsorship disclosure.
      </label>
      {err && <div style={{ color: "var(--status-urgent,#ff6b7a)", fontSize: 13 }}>{err}</div>}
      {ok && <div style={{ color: "var(--status-online,#4fb07d)", fontSize: 13 }}>{ok}</div>}
      <button onClick={submit} disabled={busy}
              style={{ background: "var(--gold,#c9a227)", color: "#000", border: "none",
                       borderRadius: 6, padding: "10px 16px", fontWeight: 600, cursor: "pointer",
                       alignSelf: "flex-start", opacity: busy ? 0.5 : 1 }}>
        {busy ? "Submitting…" : "Submit post link"}
      </button>
    </div>
  );
}

function WalletPanel({ balance, entries }: { balance: number; entries: CreditEntry[] }) {
  return (
    <div>
      <Stat label="Current balance" value={balance.toLocaleString()} sub="credits" />
      <h3 style={{ color: "var(--gold-light,#f0c040)", fontSize: 14, marginTop: 20 }}>Transaction history</h3>
      {entries.length === 0 ? <Empty text="No transactions yet." /> : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
              <th style={{ padding: "6px 8px" }}>Date</th><th>Kind</th><th>Change</th><th>After</th><th>Note</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid var(--border,#2a2218)", color: "var(--text,#f5f0e8)" }}>
                <td style={{ padding: "6px 8px" }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                <td>{e.kind}</td>
                <td style={{ color: e.delta >= 0 ? "var(--status-online,#4fb07d)" : "var(--status-urgent,#ff6b7a)" }}>
                  {e.delta >= 0 ? "+" : ""}{e.delta}
                </td>
                <td>{e.balanceAfter}</td>
                <td style={{ color: "var(--text-muted,#a89880)" }}>{e.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RewardsPanel({ catalog, balance, onRedeemed }: { catalog: RewardProduct[]; balance: number; onRedeemed: () => void }) {
  const [address, setAddress] = useState({ name: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "US" });
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const redeem = async (sku: string) => {
    for (const f of ["name", "line1", "city", "region", "postalCode", "country"] as const) {
      if (!address[f].trim()) { setErr(`Shipping ${f} required.`); return; }
    }
    setBusy(sku); setErr(null);
    try {
      const res = await fetch("/api/creators/rewards/redeem", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku, shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Redeem failed."); return; }
      onRedeemed();
    } finally { setBusy(null); }
  };

  const input: React.CSSProperties = {
    background: "#000", color: "var(--text,#f5f0e8)",
    border: "1px solid var(--border,#2a2218)", borderRadius: 6,
    padding: "8px 10px", fontSize: 13, width: "100%",
  };

  return (
    <div>
      <div style={{ marginBottom: 20, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {(["name", "line1", "line2", "city", "region", "postalCode", "country"] as const).map((k) => (
          <label key={k} style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
            {k}
            <input value={address[k]} onChange={(e) => setAddress({ ...address, [k]: e.target.value })} style={input} maxLength={k === "country" ? 2 : 80} />
          </label>
        ))}
      </div>
      {err && <div style={{ color: "var(--status-urgent,#ff6b7a)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10,
                   gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
        {catalog.map((r) => (
          <li key={r.sku} style={{
            background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
            borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6,
          }}>
            <strong style={{ color: "var(--gold-light,#f0c040)" }}>{r.label}</strong>
            <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>
              {r.credits} credits · {r.inventory} in stock{!r.internationalEligible && " · US only"}
            </div>
            <button onClick={() => redeem(r.sku)} disabled={balance < r.credits || busy === r.sku || r.inventory <= 0}
                    style={{ marginTop: "auto", background: "var(--gold,#c9a227)", color: "#000",
                             border: "none", borderRadius: 6, padding: "6px 12px",
                             fontWeight: 600, cursor: "pointer",
                             opacity: balance < r.credits || r.inventory <= 0 ? 0.5 : 1 }}>
              {busy === r.sku ? "Redeeming…" : "Redeem"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShippingPanel({ shipments }: { shipments: Redemption[] }) {
  if (shipments.length === 0) return <Empty text="No shipments yet." />;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {shipments.map((s) => (
        <li key={s.id} style={{
          background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
          borderRadius: 10, padding: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong style={{ color: "var(--gold-light,#f0c040)" }}>{s.productLabel}</strong>
            <span style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>{s.status}</span>
          </div>
          <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginTop: 4 }}>
            {s.creditsSpent} credits · {new Date(s.createdAt).toLocaleString()}
            {s.trackingNumber && ` · ${s.trackingCarrier} ${s.trackingNumber}`}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReferralPanel({ creator }: { creator: Creator }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/?ref=${creator.referralCode}` : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Stat label="Referral code" value={creator.referralCode} />
      <div style={{ display: "flex", gap: 8 }}>
        <input readOnly value={link} style={{
          background: "#000", color: "var(--text,#f5f0e8)",
          border: "1px solid var(--border,#2a2218)", borderRadius: 6,
          padding: "8px 10px", fontSize: 13, flex: 1,
        }} />
        <button onClick={() => navigator.clipboard.writeText(link)}
                style={{ background: "var(--gold,#c9a227)", color: "#000",
                         border: "none", borderRadius: 6, padding: "8px 14px",
                         fontWeight: 600, cursor: "pointer" }}>Copy</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Stat label="Clicks" value={creator.referralClicks.toString()} />
        <Stat label="Conversions" value={creator.referralConversions.toString()} />
      </div>
    </div>
  );
}

function ProfilePanel({ creator }: { creator: Creator }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, color: "var(--text,#f5f0e8)", fontSize: 13 }}>
      <div><strong>Username:</strong> {creator.playerUsername}</div>
      <div><strong>Email:</strong> {creator.email}</div>
      <div><strong>Country:</strong> {creator.country}</div>
      <div><strong>Category:</strong> {creator.contentCategory}</div>
      <div><strong>Tier:</strong> {creator.tier}</div>
      <h4 style={{ color: "var(--gold-light,#f0c040)", marginTop: 8 }}>Social accounts</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {creator.socialAccounts.map((s, i) => (
          <li key={i} style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>
            {s.platform} · @{s.handle} · {s.followers.toLocaleString()} followers
            {s.verified ? " · verified ✓" : " · unverified"}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- shared bits ----------

function Tabs({ tabs, tab, onTab }: { tabs: { id: Tab; label: string }[]; tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onTab(t.id)}
                style={{ background: tab === t.id ? "var(--gold,#c9a227)" : "transparent",
                         color: tab === t.id ? "#000" : "var(--text,#f5f0e8)",
                         border: `1px solid ${tab === t.id ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"}`,
                         borderRadius: 999, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                  borderRadius: 10, padding: 14 }}>
      <div style={{ color: "var(--text-muted,#a89880)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ color: "var(--gold-light,#f0c040)", fontSize: 24, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ label, now, max }: { label: string; now: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, (now / max) * 100);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted,#a89880)" }}>
        <span>{label}</span><span>{now} / {max}</span>
      </div>
      <div style={{ height: 6, background: "var(--border,#2a2218)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold,#c9a227)" }} />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>{text}</p>;
}

function Banner({ level, children }: { level: "gold" | "red"; children: React.ReactNode }) {
  return (
    <div style={{
      background: level === "red" ? "rgba(255,107,122,.08)" : "rgba(201,162,39,.08)",
      border: `1px solid ${level === "red" ? "var(--status-urgent,#ff6b7a)" : "var(--gold,#c9a227)"}`,
      color: level === "red" ? "var(--status-urgent,#ff6b7a)" : "var(--gold-light,#f0c040)",
      padding: "10px 12px", borderRadius: 8, fontSize: 13,
    }}>{children}</div>
  );
}
