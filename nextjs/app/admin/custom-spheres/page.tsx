import { listCustomSphereOrders } from "@/lib/db/collections/custom-sphere-orders";
import UpdateControls from "./UpdateControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Custom spheres · Admin" };

export default async function AdminCustomSpheresPage() {
  const open = await listCustomSphereOrders();
  const active = open.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const done = open.filter((o) => o.status === "delivered" || o.status === "cancelled").slice(0, 30);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin · Fulfillment</p>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>
        Custom sphere orders
      </h1>

      <section>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Active ({active.length})</h2>
        {active.length === 0 ? <Empty /> : <OrderList rows={active} />}
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>Recently closed</h2>
        {done.length === 0 ? <Empty /> : <OrderList rows={done} readOnly />}
      </section>
    </main>
  );
}

function Empty() {
  return <p style={{ color: "var(--text-muted,#a89880)" }}>Nothing here.</p>;
}

function OrderList({ rows, readOnly }: { rows: Awaited<ReturnType<typeof listCustomSphereOrders>>; readOnly?: boolean }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((o) => (
        <li key={o.id} style={{
          padding: 14, background: "var(--bg2,#0d0b08)",
          border: "1px solid var(--border,#2a2218)", borderRadius: 8,
          display: "grid", gridTemplateColumns: "90px 1fr auto", gap: 12,
        }}>
          {o.designPreviewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={o.designPreviewUrl} alt="" style={{ width: 90, borderRadius: 4, imageRendering: "pixelated" }} />
          ) : <div style={{ width: 90, background: "var(--bg3,#111009)", borderRadius: 4 }} />}
          <div style={{ color: "var(--text,#f5f0e8)" }}>
            <div style={{ fontWeight: 600 }}>{o.designTitle}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
              {o.playerDisplayName} (@{o.playerUsername}) · ${(o.priceCents / 100).toFixed(2)} {o.currency.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {o.shippingName}, {o.shippingLine1}
              {o.shippingLine2 ? `, ${o.shippingLine2}` : ""}, {o.shippingCity}, {o.shippingRegion} {o.shippingPostalCode}, {o.shippingCountry}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", marginTop: 4 }}>
              Placed {new Date(o.createdAt).toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)",
                           textTransform: "uppercase", letterSpacing: ".08em" }}>Status</div>
            <strong style={{ color: "var(--gold-light,#f0c040)" }}>{o.status}</strong>
            {!readOnly && <UpdateControls id={o.id} currentStatus={o.status} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
