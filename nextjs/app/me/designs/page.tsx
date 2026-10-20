import { redirect } from "next/navigation";
import Link from "next/link";
import { currentPlayer } from "@/lib/auth/player-session";
import { listDesignsFor } from "@/lib/db/collections/sphere-designs";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FGrid, FBtnGoldLink, FBtnGhost } from "@/components/feature/primitives";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your designs · Sphere of Kings" };

export default async function MyDesignsPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/designs");
  const designs = await listDesignsFor(me.id);

  return (
    <FeaturePage
      eyebrow="Sphere painter"
      title="Your sphere designs"
      subtitle="Paint, save, preview in 3D, and order a hand-finished physical copy."
      action={<FBtnGoldLink href="/sphere/paint">+ New design</FBtnGoldLink>}
    >
      {designs.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          No designs yet. <Link href="/sphere/paint" style={{ color: "var(--gold-light,#f0c040)" }}>Paint one</Link>.
        </p>
      ) : (
        <FGrid $min="240px">
          {designs.map((d) => (
            <FCard key={d.id}>
              {(d.previewBlobKey || d.previewDataUrl) && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={d.previewBlobKey ?? d.previewDataUrl ?? ""} alt=""
                     style={{ width: "100%", borderRadius: 6, imageRendering: "pixelated", marginBottom: 10 }} />
              )}
              <h3>{d.title}</h3>
              <p style={{ fontSize: 12 }}>Updated {new Date(d.updatedAt).toLocaleDateString()}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link href={`/sphere/paint/${d.id}`}><FBtnGhost as="span">Edit</FBtnGhost></Link>
                <Link href={`/sphere/order/${d.id}`}><FBtnGoldLink as="span">Order</FBtnGoldLink></Link>
              </div>
            </FCard>
          ))}
        </FGrid>
      )}
    </FeaturePage>
  );
}
