import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts } from "@/lib/db/collections/blog";
import FeaturePage from "@/components/feature/FeaturePage";
import { FCard, FEyebrow } from "@/components/feature/primitives";

export const metadata: Metadata = {
  title: "Blog · Sphere of Kings",
  description: "Posts and videos from James Bowser on the game, the geometry, and the platform.",
};
export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const posts = await listPublishedPosts();
  return (
    <FeaturePage
      eyebrow="Blog & Vlog"
      title="Posts"
      subtitle="Essays and videos from the founding team on the game, its geometry, and the platform."
      centered
    >
      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No posts yet. Check back soon.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, marginInline: "auto" }}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <FCard>
                  <FEyebrow>{p.tags.join(" · ")}</FEyebrow>
                  <h3 style={{ fontSize: "1.4rem", marginTop: 0 }}>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14,
                                fontFamily: "'Cinzel',serif", letterSpacing: ".08em",
                                textTransform: "uppercase" }}>
                    {p.authorDisplayName} · {p.publishedAt && new Date(p.publishedAt).toLocaleDateString()}
                  </div>
                </FCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </FeaturePage>
  );
}
