import Link from "next/link";
import { listAllPosts } from "@/lib/db/collections/blog";
import PostEditor from "./PostEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog · Admin" };

export default async function AdminBlogPage() {
  const all = await listAllPosts();
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "var(--gold,#c9a227)", fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Admin · Blog</p>
      <h1 style={{ margin: "0 0 20px", color: "var(--text,#f5f0e8)", fontSize: 24 }}>Posts</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>New post</h2>
        <PostEditor />
      </section>

      <section>
        <h2 style={{ fontSize: 15, color: "var(--gold-light,#f0c040)" }}>All posts</h2>
        {all.length === 0 ? (
          <p style={{ color: "var(--text-muted,#a89880)" }}>None yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {all.map((p) => (
              <li key={p.slug} style={{
                padding: "10px 14px", background: "var(--bg2,#0d0b08)",
                border: "1px solid var(--border,#2a2218)", borderRadius: 6,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div>
                  <strong style={{ color: "var(--text,#f5f0e8)" }}>{p.title}</strong>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted,#a89880)" }}>
                    {p.slug} · {p.status}
                  </span>
                </div>
                <Link href={`/blog/${p.slug}`} style={{ color: "var(--gold-light,#f0c040)", textDecoration: "none" }}>
                  View →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
