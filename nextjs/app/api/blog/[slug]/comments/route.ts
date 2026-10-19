import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import { getPostBySlug, insertComment, listCommentsForPost, BlogComment, ensureBlogIndexes } from "@/lib/db/collections/blog";
import { moderateText } from "@/lib/moderation";
import { canMessage, minorGateMessage } from "@/lib/safety-gates";

export const runtime = "nodejs";

export async function GET(
  _req: Request, { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const comments = await listCommentsForPost(slug);
  return NextResponse.json({ comments });
}

export async function POST(
  req: Request, { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "sign in to comment" }, { status: 401 });
  // Comments share the same gate as messaging — the moderation and
  // safety posture is identical to Phase 6's messaging surface.
  if (!canMessage(me)) {
    return NextResponse.json({ error: minorGateMessage("comment") }, { status: 403 });
  }

  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }

  let body: { body?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const text = (body.body ?? "").trim();
  if (text.length < 2) return NextResponse.json({ error: "too short" }, { status: 400 });

  const verdict = await moderateText(text);
  if (verdict.status === "blocked") {
    return NextResponse.json({ error: `Comment blocked: ${verdict.reason}` }, { status: 400 });
  }

  await ensureBlogIndexes();

  const row: BlogComment = {
    id: randomUUID(),
    postSlug: slug,
    authorId: me.id,
    authorUsername: me.username,
    authorDisplayName: me.displayName,
    body: text,
    createdAt: new Date().toISOString(),
    moderationStatus: verdict.status,
    moderationReason: verdict.status === "flagged" ? verdict.reason : undefined,
    moderationScore: "score" in verdict ? verdict.score : undefined,
  };
  await insertComment(row);
  return NextResponse.json({ comment: row });
}
