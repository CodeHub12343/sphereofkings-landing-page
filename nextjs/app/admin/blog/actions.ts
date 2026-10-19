"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import { BlogPost, ensureBlogIndexes, getPostBySlug, upsertPost } from "@/lib/db/collections/blog";

async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  const admin = await readSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!admin) throw new Error("admin only");
}

export async function upsertPostAction(
  _prev: { error?: string; ok?: boolean; slug?: string },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; slug?: string }> {
  try { await requireAdmin(); }
  catch { return { error: "Admin sign-in required." }; }

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return { error: "Slug must be 3–80 chars (lowercase, numbers, dashes)." };
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const bodyMarkdown = String(formData.get("bodyMarkdown") ?? "");
  const status = String(formData.get("status") ?? "draft") as BlogPost["status"];
  const vlogEmbedUrl = String(formData.get("vlogEmbedUrl") ?? "").trim() || undefined;
  const heroImageUrl = String(formData.get("heroImageUrl") ?? "").trim() || undefined;
  const tags = String(formData.get("tags") ?? "")
    .split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);

  if (title.length < 3) return { error: "Title too short." };
  if (excerpt.length < 3) return { error: "Excerpt too short." };
  if (bodyMarkdown.length < 10) return { error: "Body too short." };
  if (!["draft", "published", "archived"].includes(status)) {
    return { error: "Bad status." };
  }

  await ensureBlogIndexes();
  const existing = await getPostBySlug(slug);
  const now = new Date().toISOString();
  const post: BlogPost = {
    slug, title, excerpt, bodyMarkdown, status,
    vlogEmbedUrl, heroImageUrl, tags,
    authorDisplayName: existing?.authorDisplayName ?? "James Bowser",
    publishedAt: status === "published"
      ? (existing?.publishedAt ?? now)
      : existing?.publishedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await upsertPost(post);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
  return { ok: true, slug };
}
