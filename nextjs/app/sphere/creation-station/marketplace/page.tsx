import Link from "next/link";
import FeaturePage from "@/components/feature/FeaturePage";
import { ensureCreationIndexes, listMarketplace } from "@/lib/db/collections/creation-designs";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  await ensureCreationIndexes();
  const items = await listMarketplace(60);
  return (
    <FeaturePage
      eyebrow="Creation Station · Marketplace"
      title="Community creations"
      subtitle="Designs shared by other players. Buy one and the creator earns their royalty share."
    >
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No published creations yet — be the first.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12,
                     gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {items.map((c) => (
            <li key={c.id} style={{
              background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
              borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6,
            }}>
              {c.previewDataUrl || c.previewBlobKey ? (
                <img src={c.previewBlobKey ?? c.previewDataUrl} alt=""
                     style={{ width: "100%", borderRadius: 6 }} />
              ) : (
                <div style={{ height: 120, borderRadius: 6,
                              background: "linear-gradient(135deg,#1a1510,#2b2210)" }} />
              )}
              <strong style={{ color: "var(--gold-light,#f0c040)" }}>{c.title}</strong>
              <div style={{ fontSize: 11, color: "var(--text-muted,#a89880)" }}>
                by {c.playerUsername} · ♥ {c.marketplaceVotes} · royalty {(c.royaltyBps/100).toFixed(1)}%
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.tags.slice(0, 4).map((t) => (
                  <span key={t} style={{
                    background: "#000", border: "1px solid var(--border,#2a2218)",
                    borderRadius: 999, padding: "2px 8px", fontSize: 10, color: "var(--text-muted,#a89880)",
                  }}>{t}</span>
                ))}
              </div>
              <Link href={`/sphere/creation-station/marketplace/${c.id}`}
                    style={{ color: "#000", background: "var(--gold,#c9a227)", padding: "6px 10px",
                             borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </FeaturePage>
  );
}
