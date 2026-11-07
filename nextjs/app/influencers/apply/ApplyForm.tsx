"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

type P = "tiktok" | "instagram" | "facebook" | "youtube";

// Row layout for a single social-account entry.
//  - Wide (>720px): one line, 5 columns — platform, handle, URL, followers, remove.
//  - Narrow: the four fields stack into a 2-column grid and the remove button
//    sits full-width underneath, so no column shrinks into unreadable 60-px chips.
const SocialRow = styled.div`
  display: grid;
  gap: 8px;
  align-items: end;
  grid-template-columns: 140px 1fr 1fr 110px 32px;
  padding: 10px;
  background: #000;
  border: 1px solid var(--border, #2a2218);
  border-radius: 8px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr 1fr;
    .remove-btn { grid-column: 1 / -1; }
  }
`;

const TwoCol = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 2fr;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

interface SocialRow { platform: P; handle: string; url: string; followers: number; }

const PLATFORMS: { value: P; label: string }[] = [
  { value: "tiktok", label: "TikTok" }, { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" }, { value: "youtube", label: "YouTube" },
];

export default function ApplyForm() {
  const router = useRouter();
  const [country, setCountry] = useState("US");
  const [category, setCategory] = useState("");
  const [socials, setSocials] = useState<SocialRow[]>([
    { platform: "tiktok", handle: "", url: "", followers: 0 },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const addRow = () => setSocials([...socials, { platform: "instagram", handle: "", url: "", followers: 0 }]);
  const removeRow = (i: number) => setSocials(socials.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<SocialRow>) =>
    setSocials(socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const submit = async () => {
    setErr(null);
    if (!category.trim()) return setErr("Content category is required.");
    if (!agreed) return setErr("Please accept the Creator Agreement.");
    if (socials.some((s) => !s.handle.trim() || !s.url.trim()))
      return setErr("Each social row needs a handle and URL.");
    setBusy(true);
    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country, contentCategory: category,
          socialAccounts: socials, agreementVersion: "v1",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Application failed."); return; }
      router.push("/influencers/dashboard");
    } finally { setBusy(false); }
  };

  const F = (label: string, inner: React.ReactNode) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-muted,#a89880)" }}>
      {label}{inner}
    </label>
  );
  const inputStyle: React.CSSProperties = {
    background: "#000", color: "var(--text,#f5f0e8)",
    border: "1px solid var(--border,#2a2218)", borderRadius: 6,
    padding: "8px 10px", fontSize: 13, fontFamily: "inherit", width: "100%",
  };

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
      <TwoCol>
        {F("Country (ISO-2)", <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} style={inputStyle} />)}
        {F("Content category", <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. family, board games, lifestyle" style={inputStyle} />)}
      </TwoCol>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <strong style={{ color: "var(--gold-light,#f0c040)", fontSize: 14 }}>Social accounts</strong>
        {socials.map((s, i) => (
          <SocialRow key={i}>
            {F("Platform", (
              <select value={s.platform} onChange={(e) => update(i, { platform: e.target.value as P })} style={inputStyle}>
                {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            ))}
            {F("Handle", <input value={s.handle} onChange={(e) => update(i, { handle: e.target.value })} placeholder="yourname" style={inputStyle} />)}
            {F("Profile URL", <input value={s.url} onChange={(e) => update(i, { url: e.target.value })} placeholder="https://" style={inputStyle} />)}
            {F("Followers", <input type="number" min={0} value={s.followers} onChange={(e) => update(i, { followers: Math.max(0, +e.target.value || 0) })} style={inputStyle} />)}
            <button className="remove-btn" onClick={() => removeRow(i)} disabled={socials.length === 1}
                    style={{ background: "transparent", color: "var(--status-urgent,#ff6b7a)",
                             border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                             padding: "8px 0", cursor: "pointer" }}
                    aria-label="Remove this social account">× Remove</button>
          </SocialRow>
        ))}
        <button onClick={addRow} disabled={socials.length >= 4}
                style={{ alignSelf: "flex-start", background: "transparent", color: "var(--gold-light,#f0c040)",
                         border: "1px dashed var(--border,#2a2218)", borderRadius: 6,
                         padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
          + Add another ({socials.length}/4)
        </button>
      </div>

      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text,#f5f0e8)", fontSize: 13, lineHeight: 1.5 }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        I accept the Creator Kingdom agreement: I will disclose sponsored content, publish within agreed deadlines,
        own or have rights to the content I create, and understand Creator Credits have no cash value.
      </label>

      {err && <div style={{ color: "var(--status-urgent,#ff6b7a)", fontSize: 13 }}>{err}</div>}

      <button onClick={submit} disabled={busy || !agreed}
              style={{ background: "var(--gold,#c9a227)", color: "#000", border: "none",
                       borderRadius: 6, padding: "10px 16px", fontWeight: 600, cursor: "pointer",
                       opacity: busy || !agreed ? 0.5 : 1, alignSelf: "flex-start" }}>
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </div>
  );
}
