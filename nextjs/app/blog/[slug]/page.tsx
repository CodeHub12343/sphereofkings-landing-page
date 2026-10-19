import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, listCommentsForPost } from "@/lib/db/collections/blog";
import { currentPlayer } from "@/lib/auth/player-session";
import { renderMarkdown } from "@/lib/markdown";
import { parseVlogEmbed } from "@/lib/vlog-embed";
import CommentsSection from "./CommentsSection";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} · Sphere of Kings`,
    description: post.excerpt,
  };
}

export default async function BlogPost(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();
  const [me, comments] = await Promise.all([
    currentPlayer(),
    listCommentsForPost(slug),
  ]);
  const html = renderMarkdown(post.bodyMarkdown);
  const embed = parseVlogEmbed(post.vlogEmbedUrl);

  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 760, margin: "0 auto" }}>
      <Link href="/blog" style={{ color: "var(--gold,#c9a227)", textDecoration: "none", fontSize: 14 }}>← All posts</Link>
      <article style={{ marginTop: 20 }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted,#a89880)",
                        textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            {post.tags.join(" · ")}
          </div>
          <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: "clamp(26px,4vw,38px)" }}>{post.title}</h1>
          <div style={{ color: "var(--text-muted,#a89880)", fontSize: 13, marginTop: 8 }}>
            By {post.authorDisplayName} · {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
          </div>
        </header>

        {post.heroImageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={post.heroImageUrl} alt=""
               style={{ width: "100%", borderRadius: 12, marginBottom: 24,
                        border: "1px solid var(--border,#2a2218)" }} />
        )}

        {embed && (
          <div style={{ margin: "0 0 24px", borderRadius: 12, overflow: "hidden",
                        aspectRatio: "16 / 9", background: "var(--bg2,#0d0b08)",
                        border: "1px solid var(--border,#2a2218)" }}>
            <iframe src={embed.src} title={`${post.title} video`} allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        )}
        {post.vlogEmbedUrl && !embed && (
          <p style={{ fontSize: 14, color: "var(--text-muted,#a89880)" }}>
            Watch the video: <a href={post.vlogEmbedUrl} rel="nofollow noopener"
                                 style={{ color: "var(--gold-light,#f0c040)" }}>{post.vlogEmbedUrl}</a>
          </p>
        )}

        <div className="prose" style={{ color: "var(--text,#f5f0e8)", lineHeight: 1.7, fontSize: 16 }}
             dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <hr style={{ margin: "40px 0", border: 0, borderTop: "1px solid var(--border,#2a2218)" }} />
      <CommentsSection
        slug={slug}
        initialComments={comments}
        signedIn={!!me}
        isMinor={me?.isMinor && me?.consentStatus !== "parental-granted"}
      />
    </main>
  );
}
