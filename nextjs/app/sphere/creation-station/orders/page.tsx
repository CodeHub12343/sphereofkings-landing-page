import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import {
  ensureCreationOrderIndexes, listCreationOrdersFor,
} from "@/lib/db/collections/creation-orders";

export const dynamic = "force-dynamic";

function fmt(c: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
}

export default async function OrdersPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/sphere/creation-station/orders");
  await ensureCreationOrderIndexes();
  const orders = await listCreationOrdersFor(me.id);
  return (
    <FeaturePage
      eyebrow="Creation Station · Orders"
      title="My orders"
      subtitle="Track production status, see tracking numbers once your creation ships."
    >
      {orders.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No orders yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <li key={o.id} style={{
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <strong style={{ color: "var(--gold-light,#f0c040)" }}>{o.creationTitle}</strong>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
                  #{o.id.slice(0, 8)} · {new Date(o.createdAt).toLocaleString()} · {o.status}
                </div>
              </div>
              <div style={{ textAlign: "right", color: "var(--text,#f5f0e8)" }}>
                <div>{fmt(o.totalCents)}</div>
                {o.trackingNumber && (
                  <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)" }}>
                    {o.trackingCarrier} {o.trackingNumber}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </FeaturePage>
  );
}
