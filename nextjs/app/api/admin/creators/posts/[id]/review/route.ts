import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import {
  getAssignment, PostStatus, transitionPost, updateAssignment,
} from "@/lib/db/collections/creator-assignments";
import {
  getCreator, incrementCreator, updateCreator,
} from "@/lib/db/collections/creators";
import {
  CreditEntry, ensureCreditIndexes, recordEntry, sumBalance,
} from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

// Single review endpoint. `id` is the assignmentId (the post belongs to
// one assignment). Body: { postId, action, note? }. Action ∈ approve |
// reject | recheck | invalidate.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as {
    postId?: string; action?: "approve" | "reject" | "recheck" | "invalidate"; note?: string;
  };
  if (!body.postId || !body.action)
    return NextResponse.json({ error: "postId and action required" }, { status: 400 });

  const map: Record<string, PostStatus> = {
    approve: "approved", reject: "rejected", recheck: "recheck-needed", invalidate: "invalidated",
  };
  const newStatus = map[body.action];
  if (!newStatus) return NextResponse.json({ error: "bad action" }, { status: 400 });

  const after = await transitionPost(id, body.postId, newStatus, body.note, admin.user.id);
  if (!after) return NextResponse.json({ error: "assignment or post not found" }, { status: 404 });

  // Did this transition complete the assignment?
  const completed =
    after.approvedOriginalVideos >= after.originalVideosRequired &&
    after.approvedPosts >= after.totalPostsRequired &&
    !after.creditsIssued;

  if (completed) {
    await ensureCreditIndexes();
    const creator = await getCreator(after.creatorId);
    if (creator) {
      const before = await sumBalance(creator.id);
      const entry: CreditEntry = {
        id: randomUUID(), creatorId: creator.id,
        kind: "earn", delta: after.creditsOnCompletion,
        balanceAfter: before + after.creditsOnCompletion,
        idempotencyKey: `assignment:${after.id}`,
        assignmentId: after.id,
        note: `Completed "${after.campaignName}"`,
        adminId: admin.user.id,
        createdAt: new Date().toISOString(),
      };
      const r = await recordEntry(entry);
      if (r === "ok") {
        await updateAssignment(after.id, {
          status: "completed",
          completedAt: new Date().toISOString(),
          creditsIssued: true,
          creditsIssuedAt: new Date().toISOString(),
        });
        await updateCreator(creator.id, { creditsBalance: entry.balanceAfter });
        await incrementCreator(creator.id, { lifetimePostsApproved: after.approvedPosts });
      }
      // If duplicate, credits were already issued in a previous call — do nothing.
    }
  }

  const refreshed = await getAssignment(id);
  return NextResponse.json({ assignment: refreshed });
}
