import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listDesignsFor } from "@/lib/db/collections/sphere-designs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your designs · Sphere of Kings" };

export default async function MyDesignsPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/designs");
  const designs = await listDesignsFor(me.id);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 20, display: "flex", justifyContent: "space-between",
                       alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 26 }}>Your sphere designs</h1>
        <Link href="/sphere/paint" style={{
          background: "var(--gold,#c9a227)", color: "#000", padding: "8px 14px",
          borderRadius: 6, textDecoration: "none", fontWeight: 600, fontSize: 14,
        }}>+ New design</Link>
      </header>
      {designs.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>
          No designs yet. <Link href="/sphere/paint" style={{ color: "var(--gold-light,#f0c040)" }}>Paint one</Link>.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 14,
                      gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {designs.map((d) => (
            <div key={d.id} style={{
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 10, padding: 10, color: "var(--text,#f5f0e8)",
            }}>
              {(d.previewBlobKey || d.previewDataUrl) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={d.previewBlobKey ?? d.previewDataUrl ?? ""} alt=""
                     style={{ width: "100%", borderRadius: 6, imageRendering: "pixelated" }} />
              )}
              <div style={{ fontWeight: 600, marginTop: 8 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)" }}>
                Updated {new Date(d.updatedAt).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link href={`/sphere/paint/${d.id}`} style={linkBtn}>Edit</Link>
                <Link href={`/sphere/order/${d.id}`} style={linkBtn}>Order</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const linkBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: 5, fontSize: 13,
  background: "var(--bg3,#111009)", color: "var(--text,#f5f0e8)",
  border: "1px solid var(--border,#2a2218)", textDecoration: "none",
};
