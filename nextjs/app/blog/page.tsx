import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts } from "@/lib/db/collections/blog";

export const metadata: Metadata = {
  title: "Blog · Sphere of Kings",
  description: "Posts and videos from James Bowser on the game, the geometry, and the platform.",
};
export const dynamic = "force-dynamic";

export default async function BlogIndex() {
  const posts = await listPublishedPosts();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>Blog & Vlog</p>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 32 }}>Posts</h1>
      </header>
      {posts.length === 0 ? (
        <p style={{ color: "var(--text-muted,#a89880)" }}>No posts yet. Check back soon.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} style={{
                display: "block", padding: 20,
                background: "var(--bg2,#0d0b08)", border: "1px solid var(--border,#2a2218)",
                borderRadius: 10, color: "var(--text,#f5f0e8)", textDecoration: "none",
              }}>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)",
                              textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
                  {p.tags.join(" · ")}
                </div>
                <h2 style={{ margin: "0 0 8px", color: "var(--gold-light,#f0c040)", fontSize: 22 }}>{p.title}</h2>
                <p style={{ margin: 0, color: "var(--text-muted,#a89880)", fontSize: 14 }}>{p.excerpt}</p>
                <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)", marginTop: 10 }}>
                  {p.authorDisplayName} · {p.publishedAt && new Date(p.publishedAt).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
