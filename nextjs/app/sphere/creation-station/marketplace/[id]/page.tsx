import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturePage from "@/components/feature/FeaturePage";
import { getCreation } from "@/lib/db/collections/creation-designs";
import VoteButtons from "./VoteButtons";

export const dynamic = "force-dynamic";

export default async function MarketplaceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCreation(id);
  if (!c || !c.isPublic || c.moderationState === "blocked") notFound();

  return (
    <FeaturePage
      eyebrow="Creation Station · Marketplace"
      title={c.title}
      subtitle={`by ${c.playerUsername} · royalty ${(c.royaltyBps/100).toFixed(1)}%`}
    >
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        <div>
          {c.previewDataUrl || c.previewBlobKey ? (
            <img src={c.previewBlobKey ?? c.previewDataUrl} alt=""
                 style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border,#2a2218)" }} />
          ) : (
            <div style={{ height: 360, borderRadius: 10,
                          background: "linear-gradient(135deg,#1a1510,#2b2210)" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {c.tags.map((t) => (
              <span key={t} style={{
                background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                borderRadius: 999, padding: "4px 10px", fontSize: 11, color: "var(--text-muted,#a89880)",
              }}>{t}</span>
            ))}
          </div>
          <div style={{ color: "var(--text-muted,#a89880)", fontSize: 13 }}>
            Finish: {c.config.finish} · Palette: {c.config.palette.length} colors
          </div>
          <VoteButtons id={c.id} initial={c.marketplaceVotes} />
          <Link href={`/sphere/creation-station/${c.id}/order`}
                style={{ color: "#000", background: "var(--gold,#c9a227)", padding: "10px 16px",
                         borderRadius: 6, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
            Order this creation →
          </Link>
          <p style={{ color: "var(--text-muted,#a89880)", fontSize: 12 }}>
            Ordering this design pays {(c.royaltyBps/100).toFixed(1)}% royalty to {c.playerUsername}.
          </p>
        </div>
      </div>
    </FeaturePage>
  );
}
