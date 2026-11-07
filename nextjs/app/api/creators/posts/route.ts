import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId } from "@/lib/db/collections/creators";
import {
  getAssignment, PostSubmission, tryAppendPost,
} from "@/lib/db/collections/creator-assignments";
import { parsePostUrl, PostParseError } from "@/lib/creator-kingdom/post-verification";

export const runtime = "nodejs";

// Submit a social post for an active assignment. Automated pre-screening:
//  - URL must parse to one of the supported platforms
//  - canonical (platform, post id) must be globally unique
//  - assignment must be active and own by the creator
//  - originalVideoId must belong to this assignment
//  - assignment deadline must not have passed
export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator || creator.state !== "approved")
    return NextResponse.json({ error: "creator not approved" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as {
    assignmentId?: string;
    originalVideoId?: string;
    url?: string;
    publishedAt?: string;
    disclosureVerified?: boolean;
  };
  if (!body.assignmentId || !body.originalVideoId || !body.url)
    return NextResponse.json({ error: "assignmentId, originalVideoId, url required" }, { status: 400 });

  const a = await getAssignment(body.assignmentId);
  if (!a || a.creatorId !== creator.id)
    return NextResponse.json({ error: "assignment not found" }, { status: 404 });
  if (a.status !== "active" && a.status !== "under-review")
    return NextResponse.json({ error: `assignment is ${a.status}` }, { status: 400 });
  if (a.dueAt && Date.now() > new Date(a.dueAt).getTime())
    return NextResponse.json({ error: "deadline passed" }, { status: 400 });
  if (!a.originalVideos.find((v) => v.id === body.originalVideoId))
    return NextResponse.json({ error: "originalVideoId not part of this assignment" }, { status: 400 });

  let parsed;
  try { parsed = parsePostUrl(body.url); }
  catch (err) {
    if (err instanceof PostParseError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }

  const post: PostSubmission = {
    id: randomUUID(),
    platform: parsed.platform,
    handle: parsed.handle,
    url: parsed.normalizedUrl,
    canonicalId: parsed.canonicalId,
    originalVideoId: body.originalVideoId,
    submittedAt: new Date().toISOString(),
    publishedAt: body.publishedAt,
    status: "pending-review",   // skip "submitted" since we already pre-screened
    disclosureVerified: !!body.disclosureVerified,
  };

  const r = await tryAppendPost(body.assignmentId, post);
  if (!r.ok) {
    if (r.reason === "duplicate")
      return NextResponse.json({ error: "this post URL has already been submitted" }, { status: 409 });
    return NextResponse.json({ error: "assignment not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
