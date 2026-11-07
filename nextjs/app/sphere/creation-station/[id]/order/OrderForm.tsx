"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderForm({ creationId, creationTitle }: { creationId: string; creationTitle: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "US",
  });
  const [quantity, setQuantity] = useState(1);
  const [gift, setGift] = useState("");
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = async () => {
    if (!approved) return setErr("Please approve the design before ordering.");
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/creation-station/orders", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ creationId, quantity, shipping: form, giftMessage: gift }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Order failed."); return; }
      router.push(`/sphere/creation-station/orders`);
    } finally { setBusy(false); }
  };

  const input = (k: keyof typeof form, label: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-muted,#a89880)" }}>
      {label}
      <input value={form[k]} onChange={(e) => update(k, e.target.value)} {...extra}
             style={{ background: "#000", color: "var(--text,#f5f0e8)",
                      border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                      padding: "8px 10px", fontSize: 13 }} />
    </label>
  );

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <h3 style={{ color: "var(--gold-light,#f0c040)", margin: 0 }}>{creationTitle}</h3>
      {input("name", "Full name")}
      {input("line1", "Address line 1")}
      {input("line2", "Address line 2 (optional)")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {input("city", "City")}
        {input("region", "State / region")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {input("postalCode", "Postal code")}
        {input("country", "Country (ISO-2)", { maxLength: 2 })}
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-muted,#a89880)" }}>
        Quantity
        <input type="number" min={1} max={500} value={quantity}
               onChange={(e) => setQuantity(Math.max(1, Math.min(500, +e.target.value || 1)))}
               style={{ background: "#000", color: "var(--text,#f5f0e8)",
                        border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                        padding: "8px 10px", fontSize: 13 }} />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-muted,#a89880)" }}>
        Gift message (optional)
        <textarea rows={2} maxLength={500} value={gift} onChange={(e) => setGift(e.target.value)}
                  style={{ background: "#000", color: "var(--text,#f5f0e8)",
                           border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                           padding: "8px 10px", fontSize: 13, fontFamily: "inherit" }} />
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--text,#f5f0e8)", fontSize: 13 }}>
        <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
        I approve the design, color disclosure, price, and delivery estimate.
      </label>
      {err && <div style={{ color: "var(--status-urgent,#ff6b7a)", fontSize: 13 }}>{err}</div>}
      <button onClick={submit} disabled={busy || !approved}
              style={{ background: "var(--gold,#c9a227)", color: "#000", border: "none",
                       borderRadius: 6, padding: "10px 16px", fontWeight: 600, cursor: "pointer",
                       opacity: busy || !approved ? 0.5 : 1 }}>
        {busy ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
