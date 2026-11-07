"use client";

import { useState } from "react";
import type { Creator } from "@/lib/db/collections/creators";
import type { Assignment } from "@/lib/db/collections/creator-assignments";
import type { Redemption } from "@/lib/db/collections/creator-credits";

type Tab = "overview" | "applications" | "creators" | "review" | "fulfillment" | "campaign";

export default function AdminCommandCenter({
  pending, approved, review, redemptions,
}: {
  pending: Creator[]; approved: Creator[]; review: Assignment[]; redemptions: Redemption[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [pendingList, setPendingList] = useState(pending);
  const [approvedList, setApprovedList] = useState(approved);
  const [reviewList, setReviewList] = useState(review);
  const [redemptionList, setRedemptionList] = useState(redemptions);

  const transitionApp = async (id: string, state: "approved" | "rejected" | "suspended") => {
    const res = await fetch(`/api/admin/creators/applications/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (res.ok) {
      setPendingList((p) => p.filter((c) => c.id !== id));
      if (state === "approved") {
        const data = await res.json();
        setApprovedList((a) => [data.creator, ...a]);
      }
    }
  };

  const reviewPost = async (assignmentId: string, postId: string, action: "approve" | "reject" | "recheck") => {
    const res = await fetch(`/api/admin/creators/posts/${assignmentId}/review`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId, action }),
    });
    if (res.ok) {
      const data = await res.json();
      setReviewList((l) => l.map((a) => (a.id === assignmentId ? data.assignment : a))
                             .filter((a: Assignment) => a.posts.some((p) => ["submitted", "pending-review", "recheck-needed"].includes(p.status))));
    }
  };

  const transitionShipment = async (id: string, status: Redemption["status"], tracking?: { carrier: string; number: string }) => {
    const res = await fetch(`/api/admin/creators/fulfillment/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        trackingCarrier: tracking?.carrier, trackingNumber: tracking?.number,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRedemptionList((r) => r.map((x) => (x.id === id ? data.redemption : x)));
    }
  };

  const totalPosts = approvedList.reduce((s, c) => s + c.lifetimePostsApproved, 0);
  const totalRewards = approvedList.reduce((s, c) => s + c.lifetimeProductsEarned, 0);
  const pendingReviewCount = reviewList.reduce(
    (s, a) => s + a.posts.filter((p) => ["submitted", "pending-review", "recheck-needed"].includes(p.status)).length, 0);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto",
                  color: "var(--text,#f5f0e8)" }}>
      <h1 style={{ color: "var(--gold-light,#f0c040)", margin: "0 0 16px" }}>Creator Kingdom — admin</h1>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {(["overview", "applications", "creators", "review", "fulfillment", "campaign"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
                  style={{ background: tab === t ? "var(--gold,#c9a227)" : "transparent",
                           color: tab === t ? "#000" : "var(--text,#f5f0e8)",
                           border: `1px solid ${tab === t ? "var(--gold,#c9a227)" : "var(--border,#2a2218)"}`,
                           borderRadius: 999, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <Stat label="Active creators" value={approvedList.length.toString()} />
          <Stat label="Pending applications" value={pendingList.length.toString()} />
          <Stat label="Posts to review" value={pendingReviewCount.toString()} />
          <Stat label="Lifetime posts approved" value={totalPosts.toString()} />
          <Stat label="Products fulfilled" value={totalRewards.toString()} />
          <Stat label="Pending shipments" value={redemptionList.filter((r) => r.status === "reserved" || r.status === "fulfilling").length.toString()} />
        </div>
      )}

      {tab === "applications" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
            <th style={{ padding: "6px 8px" }}>Creator</th><th>Email</th><th>Country</th>
            <th>Followers (max)</th><th>Category</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {pendingList.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "12px 8px", color: "var(--text-muted,#a89880)" }}>Nothing pending.</td></tr>
            ) : pendingList.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                <td style={{ padding: "6px 8px" }}>{c.playerUsername}</td>
                <td>{c.email}</td><td>{c.country}</td>
                <td>{Math.max(0, ...c.socialAccounts.map((s) => s.followers)).toLocaleString()}</td>
                <td>{c.contentCategory}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => transitionApp(c.id, "approved")} style={btn("gold")}>Approve</button>
                  <button onClick={() => transitionApp(c.id, "rejected")} style={btn("red")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "creators" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
            <th style={{ padding: "6px 8px" }}>Creator</th><th>Tier</th><th>Posts</th>
            <th>Products</th><th>Credits</th><th>Referral</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {approvedList.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                <td style={{ padding: "6px 8px" }}>{c.playerUsername}</td>
                <td>{c.tier}</td>
                <td>{c.lifetimePostsApproved}</td>
                <td>{c.lifetimeProductsEarned}</td>
                <td>{c.creditsBalance}</td>
                <td style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}>{c.referralCode}</td>
                <td><button onClick={() => transitionApp(c.id, "suspended")} style={btn("red")}>Suspend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "review" && (
        reviewList.length === 0 ? <p style={{ color: "var(--text-muted,#a89880)" }}>Nothing to review.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviewList.map((a) => (
              <div key={a.id} style={card()}>
                <strong style={{ color: "var(--gold-light,#f0c040)" }}>{a.campaignName}</strong>
                <div style={{ color: "var(--text-muted,#a89880)", fontSize: 12, marginBottom: 6 }}>
                  creator {a.creatorId.slice(0, 8)} · {a.approvedPosts}/{a.totalPostsRequired} approved
                </div>
                {a.posts.filter((p) => ["submitted", "pending-review", "recheck-needed"].includes(p.status)).map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between",
                                           gap: 8, padding: "6px 0", borderTop: "1px solid var(--border,#2a2218)" }}>
                    <div>
                      <a href={p.url} target="_blank" rel="noreferrer" style={{ color: "var(--text,#f5f0e8)" }}>{p.url}</a>
                      <div style={{ color: "var(--text-muted,#a89880)", fontSize: 11 }}>
                        {p.platform} · {p.status} · disclosure {p.disclosureVerified ? "✓" : "✗"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => reviewPost(a.id, p.id, "approve")} style={btn("gold")}>Approve</button>
                      <button onClick={() => reviewPost(a.id, p.id, "reject")} style={btn("red")}>Reject</button>
                      <button onClick={() => reviewPost(a.id, p.id, "recheck")} style={btn("plain")}>Recheck</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      )}

      {tab === "fulfillment" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
            <th style={{ padding: "6px 8px" }}>Redemption</th><th>Creator</th><th>Product</th>
            <th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {redemptionList.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "12px 8px", color: "var(--text-muted,#a89880)" }}>No redemptions.</td></tr>
            ) : redemptionList.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                <td style={{ padding: "6px 8px", fontFamily: "ui-monospace,monospace", fontSize: 11 }}>{r.id.slice(0, 8)}</td>
                <td>{r.creatorId.slice(0, 8)}</td>
                <td>{r.productLabel}</td>
                <td>{r.status}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => transitionShipment(r.id, "fulfilling")} style={btn("plain")}>Fulfill</button>
                  <button onClick={() => {
                    const number = prompt("Tracking number?") ?? "";
                    const carrier = prompt("Carrier?") ?? "USPS";
                    if (number) transitionShipment(r.id, "shipped", { carrier, number });
                  }} style={btn("gold")}>Ship</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "campaign" && (
        <CampaignBuilder creators={approvedList}
                         onCreated={(a) => setReviewList((l) => [a, ...l])} />
      )}
    </div>
  );
}

function CampaignBuilder({ creators, onCreated }: { creators: Creator[]; onCreated: (a: Assignment) => void }) {
  const [form, setForm] = useState({
    creatorId: creators[0]?.id ?? "", campaignName: "",
    followers: 0, dueDays: 14, productAccess: "digital-only" as const,
    videoTitles: "Video 1\nVideo 2",
  });
  const [out, setOut] = useState<string | null>(null);

  const create = async () => {
    const res = await fetch("/api/admin/creators/campaigns", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        creatorId: form.creatorId,
        campaignName: form.campaignName,
        followers: form.followers || undefined,
        dueAt: new Date(Date.now() + form.dueDays * 86400_000).toISOString(),
        productAccess: form.productAccess,
        originalVideoTitles: form.videoTitles.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setOut(`Error: ${data.error}`); return; }
    onCreated(data.assignment);
    setOut(`Offered assignment ${data.assignment.id.slice(0, 8)} — ${data.assignment.originalVideosRequired} videos / ${data.assignment.totalPostsRequired} posts.`);
  };

  const input: React.CSSProperties = {
    background: "#000", color: "var(--text,#f5f0e8)",
    border: "1px solid var(--border,#2a2218)", borderRadius: 6,
    padding: "8px 10px", fontSize: 13, width: "100%",
  };

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Creator
        <select value={form.creatorId} onChange={(e) => setForm({ ...form, creatorId: e.target.value })} style={input}>
          {creators.map((c) => <option key={c.id} value={c.id}>{c.playerUsername}</option>)}
        </select>
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Campaign name
        <input value={form.campaignName} onChange={(e) => setForm({ ...form, campaignName: e.target.value })} style={input} />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Override followers (0 = auto)
          <input type="number" value={form.followers} onChange={(e) => setForm({ ...form, followers: +e.target.value || 0 })} style={input} />
        </label>
        <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Due in (days)
          <input type="number" value={form.dueDays} onChange={(e) => setForm({ ...form, dueDays: +e.target.value || 14 })} style={input} />
        </label>
      </div>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Product access
        <select value={form.productAccess} onChange={(e) => setForm({ ...form, productAccess: e.target.value as typeof form.productAccess })} style={input}>
          <option value="digital-only">Digital only</option>
          <option value="sample-shipped">Sample shipped</option>
          <option value="already-owns">Already owns</option>
        </select>
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>Original video titles (one per line)
        <textarea rows={3} value={form.videoTitles} onChange={(e) => setForm({ ...form, videoTitles: e.target.value })}
                  style={{ ...input, fontFamily: "inherit" }} />
      </label>
      <button onClick={create} disabled={!form.creatorId || !form.campaignName}
              style={{ ...btn("gold"), alignSelf: "flex-start" }}>
        Create & offer assignment
      </button>
      {out && <div style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>{out}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={card()}>
      <div style={{ color: "var(--text-muted,#a89880)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ color: "var(--gold-light,#f0c040)", fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function card(): React.CSSProperties {
  return { background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)", borderRadius: 10, padding: 14 };
}

function btn(kind: "gold" | "red" | "plain"): React.CSSProperties {
  return {
    background: kind === "gold" ? "var(--gold,#c9a227)" : "transparent",
    color: kind === "gold" ? "#000" : kind === "red" ? "var(--status-urgent,#ff6b7a)" : "var(--text,#f5f0e8)",
    border: kind === "red" ? "1px solid var(--status-urgent,#ff6b7a)" : "1px solid var(--border,#2a2218)",
    borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer",
  };
}
