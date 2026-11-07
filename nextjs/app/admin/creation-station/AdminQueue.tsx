"use client";

import { useState } from "react";
import type { CreationOrder, CreationOrderStatus } from "@/lib/db/collections/creation-orders";
import type { Creation } from "@/lib/db/collections/creation-designs";

const STATUSES: CreationOrderStatus[] = [
  "pending-payment", "paid", "queued", "printing", "qa", "shipped", "delivered", "cancelled", "refunded",
];

function fmt(c: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
}

export default function AdminQueue({ orders: initialOrders, review }: { orders: CreationOrder[]; review: Creation[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<"" | CreationOrderStatus>("");
  const shown = filter ? orders.filter((o) => o.status === filter) : orders;

  const transition = async (id: string, status: CreationOrderStatus) => {
    const res = await fetch(`/api/creation-station/orders/${id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((os) => os.map((o) => (o.id === id ? data.order : o)));
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto",
                  color: "var(--text,#f5f0e8)", fontFamily: "inherit" }}>
      <h1 style={{ color: "var(--gold-light,#f0c040)", margin: "0 0 16px" }}>
        Creation Station — production queue
      </h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: "var(--gold,#c9a227)" }}>
          Designs needing review ({review.length})
        </h2>
        {review.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>Nothing pending.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid",
                       gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {review.map((c) => (
              <li key={c.id} style={{
                background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                borderRadius: 8, padding: 10, fontSize: 13,
              }}>
                <strong style={{ color: "var(--gold-light,#f0c040)" }}>{c.title}</strong>
                <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)" }}>
                  by {c.playerUsername} · flags: {c.ipFlags?.join(", ") || "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
          <h2 style={{ fontSize: 16, color: "var(--gold,#c9a227)", margin: 0 }}>Orders</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value as "" | CreationOrderStatus)}
                  style={{ background: "#000", color: "var(--text,#f5f0e8)",
                           border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                           padding: "6px 8px", fontSize: 12 }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {shown.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>No orders.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-muted,#a89880)" }}>
                <th style={{ padding: "6px 8px" }}>#</th>
                <th>Creation</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Advance</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--border,#2a2218)" }}>
                  <td style={{ padding: "8px", fontFamily: "ui-monospace,monospace", fontSize: 11 }}>
                    {o.id.slice(0, 8)}
                  </td>
                  <td>{o.creationTitle}</td>
                  <td>{o.playerUsername}</td>
                  <td>{fmt(o.totalCents)}</td>
                  <td>{o.status}</td>
                  <td>
                    <select value={o.status}
                            onChange={(e) => transition(o.id, e.target.value as CreationOrderStatus)}
                            style={{ background: "#000", color: "var(--text,#f5f0e8)",
                                     border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                                     padding: "4px 6px", fontSize: 12 }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
