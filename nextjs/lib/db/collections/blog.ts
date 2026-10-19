import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogPost {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  // Markdown body — rendered server-side via the small renderer in
  // lib/markdown.ts. Blog posts are owner-signed content, so the
  // renderer trusts the input; we DO sanitise comments separately.
  bodyMarkdown: string;
  // Vlog embed — a YouTube or Vimeo URL. The page validates and
  // builds an iframe for the recognised hosts; unknown hosts are
  // shown as a text link instead.
  vlogEmbedUrl?: string;
  heroImageUrl?: string;
  authorDisplayName: string; // "James Bowser" or a guest contributor
  tags: string[];
  status: BlogPostStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  _id?: ObjectId;
  id: string;
  postSlug: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  // Moderation status is inherited from the shared moderation module.
  moderationStatus: "clean" | "flagged" | "blocked";
  moderationReason?: string;
  moderationScore?: number;
  // Soft-delete when an admin removes it; the row stays for audit.
  removedByAdminId?: string;
  removedAt?: string;
  removalReason?: string;
}

export async function ensureBlogIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<BlogPost>("blogPosts").createIndex({ slug: 1 }, { unique: true }),
    db.collection<BlogPost>("blogPosts").createIndex({ status: 1, publishedAt: -1 }),
    db.collection<BlogComment>("blogComments").createIndex({ postSlug: 1, createdAt: -1 }),
    db.collection<BlogComment>("blogComments").createIndex({ moderationStatus: 1, createdAt: -1 }),
  ]);
}

export async function listPublishedPosts(limit = 20): Promise<BlogPost[]> {
  const db = await getDb();
  return db.collection<BlogPost>("blogPosts")
    .find({ status: "published" }, { projection: { _id: 0 } })
    .sort({ publishedAt: -1 }).limit(limit).toArray();
}

export async function listAllPosts(): Promise<BlogPost[]> {
  const db = await getDb();
  return db.collection<BlogPost>("blogPosts")
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 }).limit(200).toArray();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await getDb();
  return db.collection<BlogPost>("blogPosts").findOne({ slug }, { projection: { _id: 0 } });
}

export async function upsertPost(post: BlogPost): Promise<void> {
  const db = await getDb();
  await db.collection<BlogPost>("blogPosts").updateOne(
    { slug: post.slug }, { $set: post }, { upsert: true },
  );
}

export async function updatePostFields(slug: string, patch: Partial<BlogPost>): Promise<void> {
  const db = await getDb();
  await db.collection<BlogPost>("blogPosts").updateOne({ slug }, { $set: patch });
}

/* --------------------------- Comments ------------------------------ */

export async function listCommentsForPost(slug: string, includeHidden = false): Promise<BlogComment[]> {
  const db = await getDb();
  const q: Record<string, unknown> = { postSlug: slug };
  if (!includeHidden) {
    q.moderationStatus = { $ne: "blocked" };
    q.removedAt = { $exists: false };
  }
  return db.collection<BlogComment>("blogComments")
    .find(q, { projection: { _id: 0 } })
    .sort({ createdAt: 1 }).limit(500).toArray();
}

export async function insertComment(c: BlogComment): Promise<void> {
  const db = await getDb();
  await db.collection<BlogComment>("blogComments").insertOne(c);
}

export async function softDeleteComment(id: string, adminId: string, reason: string): Promise<void> {
  const db = await getDb();
  await db.collection<BlogComment>("blogComments").updateOne(
    { id },
    { $set: {
      removedByAdminId: adminId,
      removedAt: new Date().toISOString(),
      removalReason: reason,
    } },
  );
}
