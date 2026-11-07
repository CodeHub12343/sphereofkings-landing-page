import Link from "next/link";
import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { ensureCreationIndexes, listCreationsFor } from "@/lib/db/collections/creation-designs";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/sphere/creation-station/drafts");
  await ensureCreationIndexes();
  const creations = await listCreationsFor(me.id);

  return (
    <FeaturePage
      eyebrow="Design · Creation Station"
      title="My drafts"
      subtitle="All your Creation Station designs. Resume editing, publish to the marketplace, or order prints."
    >
      {creations.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>
          You haven’t created anything yet.{" "}
          <Link href="/sphere/creation-station" style={{ color: "var(--gold-light,#f0c040)" }}>
            Start a new design →
          </Link>
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12,
                     gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {creations.map((c) => (
            <li key={c.id} style={{
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8,
            }}>
              {c.previewDataUrl || c.previewBlobKey ? (
                <img src={c.previewBlobKey ?? c.previewDataUrl} alt=""
                     style={{ width: "100%", borderRadius: 6, border: "1px solid var(--border,#2a2218)" }} />
              ) : (
                <div style={{ height: 120, borderRadius: 6, background: "linear-gradient(135deg,#1a1510,#2b2210)",
                              border: "1px solid var(--border,#2a2218)" }} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <strong style={{ color: "var(--gold-light,#f0c040)" }}>{c.title}</strong>
                <span style={{ color: "var(--text-muted,#a89880)", fontSize: 11 }}>{c.status}</span>
              </div>
              <div style={{ color: "var(--text-muted,#a89880)", fontSize: 11 }}>
                Updated {new Date(c.updatedAt).toLocaleString()}
                {c.isPublic && " · Published"}
                {c.moderationState !== "clear" && ` · ${c.moderationState}`}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Link href={`/sphere/creation-station/${c.id}`}
                      style={{ color: "#000", background: "var(--gold,#c9a227)", padding: "6px 10px",
                               borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  Edit
                </Link>
                <Link href={`/sphere/creation-station/${c.id}/order`}
                      style={{ color: "var(--text,#f5f0e8)", border: "1px solid var(--border,#2a2218)",
                               padding: "6px 10px", borderRadius: 6, fontSize: 12, textDecoration: "none" }}>
                  Order
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </FeaturePage>
  );
}
