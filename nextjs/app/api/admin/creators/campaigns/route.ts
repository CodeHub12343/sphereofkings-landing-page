import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import { getCreator } from "@/lib/db/collections/creators";
import {
  Assignment, ensureAssignmentIndexes, insertAssignment,
} from "@/lib/db/collections/creator-assignments";
import { calculateAssignment } from "@/lib/creator-kingdom/tiers";

export const runtime = "nodejs";

// Create and offer an assignment to a creator. Deliverables are frozen
// from the follower-tier calculator unless admin overrides are given
// (overrides are recorded verbatim; an audit entry documents the reason).
export async function POST(req: Request) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as {
    creatorId?: string;
    campaignId?: string;
    campaignName?: string;
    followers?: number;
    overrideVideos?: number;
    overridePosts?: number;
    overrideCredits?: number;
    dueAt?: string;
    productAccess?: "sample-shipped" | "already-owns" | "digital-only";
    originalVideoTitles?: string[];
    agreementVersion?: string;
    overrideReason?: string;
  };
  if (!body.creatorId || !body.campaignName)
    return NextResponse.json({ error: "creatorId and campaignName required" }, { status: 400 });
  const creator = await getCreator(body.creatorId);
  if (!creator) return NextResponse.json({ error: "creator not found" }, { status: 404 });
  if (creator.state !== "approved")
    return NextResponse.json({ error: `creator state is ${creator.state}` }, { status: 400 });

  const followers = body.followers ??
    creator.socialAccounts.reduce((s, a) => Math.max(s, a.followers), 0);
  let req_;
  try { req_ = calculateAssignment(followers); }
  catch { return NextResponse.json({ error: "manual tier review required" }, { status: 400 }); }

  const videos = body.overrideVideos ?? req_.originalVideosRequired;
  const posts = body.overridePosts ?? req_.totalPostsRequired;
  const credits = body.overrideCredits ?? req_.creditsOnCompletion;

  const now = new Date().toISOString();
  const row: Assignment = {
    id: randomUUID(),
    creatorId: creator.id,
    campaignId: body.campaignId ?? `campaign-${Date.now()}`,
    campaignName: body.campaignName.slice(0, 120),
    followerTierMin: req_.followerTierMin,
    originalVideosRequired: videos,
    totalPostsRequired: posts,
    creditsOnCompletion: credits,
    targetPromotionalValueUSD: req_.targetPromotionalValueUSD,
    originalVideos: (body.originalVideoTitles ?? [])
      .slice(0, videos)
      .map((title) => ({ id: randomUUID(), title: title.slice(0, 120), submittedAt: now })),
    posts: [],
    status: "offered",
    offeredAt: now,
    dueAt: body.dueAt,
    approvedOriginalVideos: 0,
    approvedPosts: 0,
    creditsIssued: false,
    productAccess: body.productAccess ?? "digital-only",
    agreementVersion: body.agreementVersion ?? "v1",
    createdAt: now, updatedAt: now,
  };

  await ensureAssignmentIndexes();
  await insertAssignment(row);
  return NextResponse.json({ assignment: row });
}
