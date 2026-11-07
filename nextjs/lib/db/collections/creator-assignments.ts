import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

// An assignment is the promotional work a creator agrees to do. Deliverable
// counts are frozen at acceptance (from the follower-tier calculator) so
// later follower fluctuations don't change the obligation. Post submissions
// are stored inline so the entire assignment packs into one document.

export type AssignmentStatus =
  | "offered"       // created by admin, awaiting creator acceptance
  | "active"        // creator accepted; working on deliverables
  | "under-review"  // all posts submitted, waiting for admin verification
  | "completed"     // credits issued
  | "cancelled"     // creator or admin cancelled
  | "expired";      // deadline passed

export type PostStatus =
  | "submitted"
  | "pending-review"
  | "approved"
  | "rejected"
  | "recheck-needed"
  | "invalidated";

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";

export interface PostSubmission {
  id: string;
  platform: Platform;
  handle: string;
  url: string;                    // normalized canonical URL
  canonicalId: string;            // platform-native post id, extracted
  originalVideoId: string;        // which original video this placement is
  submittedAt: string;
  publishedAt?: string;
  status: PostStatus;
  reviewerId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  lastRecheckAt?: string;
  disclosureVerified: boolean;
  rejectionReason?: string;
}

export interface OriginalVideo {
  id: string;
  title: string;
  submittedAt: string;
}

export interface Assignment {
  _id?: ObjectId;
  id: string;
  creatorId: string;
  campaignId: string;
  campaignName: string;
  // Snapshot from the follower-tier calculator at acceptance time.
  followerTierMin: number;
  originalVideosRequired: number;
  totalPostsRequired: number;
  creditsOnCompletion: number;
  targetPromotionalValueUSD: number;
  // Content
  originalVideos: OriginalVideo[];
  posts: PostSubmission[];
  // Lifecycle
  status: AssignmentStatus;
  offeredAt: string;
  acceptedAt?: string;
  completedAt?: string;
  dueAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  // Derived counters (kept in sync by the mutators below so queries stay cheap)
  approvedOriginalVideos: number;
  approvedPosts: number;
  // Credits issuance tracking (critical: must be issued exactly once)
  creditsIssued: boolean;
  creditsIssuedAt?: string;
  // Sample / already-owned product disclosure
  productAccess: "sample-shipped" | "already-owns" | "digital-only";
  // Agreement snapshot — what the creator accepted when taking the assignment
  agreementVersion: string;
  agreementAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function ensureAssignmentIndexes(): Promise<void> {
  const db = await getDb();
  const c = db.collection<Assignment>("creatorAssignments");
  await Promise.all([
    c.createIndex({ id: 1 }, { unique: true }),
    c.createIndex({ creatorId: 1, status: 1, updatedAt: -1 }),
    c.createIndex({ campaignId: 1 }),
    c.createIndex({ status: 1, dueAt: 1 }),
    c.createIndex({ "posts.canonicalId": 1 }),
    c.createIndex({ "posts.status": 1, updatedAt: -1 }),
  ]);
}

export async function insertAssignment(row: Assignment): Promise<void> {
  const db = await getDb();
  await db.collection<Assignment>("creatorAssignments").insertOne(row);
}
export async function getAssignment(id: string): Promise<Assignment | null> {
  const db = await getDb();
  return db.collection<Assignment>("creatorAssignments").findOne({ id }, { projection: { _id: 0 } });
}
export async function listAssignmentsForCreator(creatorId: string): Promise<Assignment[]> {
  const db = await getDb();
  return db.collection<Assignment>("creatorAssignments")
    .find({ creatorId }, { projection: { _id: 0 } })
    .sort({ updatedAt: -1 }).limit(100).toArray();
}
export async function updateAssignment(id: string, patch: Partial<Assignment>): Promise<void> {
  const db = await getDb();
  await db.collection<Assignment>("creatorAssignments").updateOne(
    { id }, { $set: { ...patch, updatedAt: new Date().toISOString() } },
  );
}

// Append a new post submission atomically, rejecting duplicates on
// (platform, canonicalId) across the entire collection so a creator can't
// re-submit the same post under a short URL / different assignment.
export async function tryAppendPost(
  assignmentId: string, post: PostSubmission,
): Promise<{ ok: true } | { ok: false; reason: "duplicate" | "not-found" }> {
  const db = await getDb();
  const col = db.collection<Assignment>("creatorAssignments");

  // Global duplicate check — one canonical post id, forever.
  const dupe = await col.findOne({
    "posts.platform": post.platform,
    "posts.canonicalId": post.canonicalId,
  }, { projection: { _id: 1 } });
  if (dupe) return { ok: false, reason: "duplicate" };

  const res = await col.updateOne(
    { id: assignmentId },
    { $push: { posts: post }, $set: { updatedAt: new Date().toISOString() } },
  );
  if ((res.matchedCount ?? 0) === 0) return { ok: false, reason: "not-found" };
  return { ok: true };
}

export async function transitionPost(
  assignmentId: string, postId: string,
  status: PostStatus, note?: string, reviewerId?: string,
): Promise<Assignment | null> {
  const db = await getDb();
  const col = db.collection<Assignment>("creatorAssignments");
  await col.updateOne(
    { id: assignmentId, "posts.id": postId },
    {
      $set: {
        "posts.$.status": status,
        "posts.$.reviewNotes": note,
        "posts.$.reviewerId": reviewerId,
        "posts.$.reviewedAt": new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  );
  const after = await getAssignment(assignmentId);
  if (!after) return null;
  // Recompute derived counters.
  const approvedPosts = after.posts.filter((p) => p.status === "approved").length;
  const approvedOriginalIds = new Set(
    after.posts.filter((p) => p.status === "approved").map((p) => p.originalVideoId),
  );
  await updateAssignment(assignmentId, {
    approvedPosts,
    approvedOriginalVideos: approvedOriginalIds.size,
  });
  return { ...after, approvedPosts, approvedOriginalVideos: approvedOriginalIds.size };
}

export async function listReviewQueue(limit = 100): Promise<Assignment[]> {
  const db = await getDb();
  return db.collection<Assignment>("creatorAssignments")
    .find(
      { "posts.status": { $in: ["submitted", "pending-review", "recheck-needed"] } },
      { projection: { _id: 0 } },
    )
    .sort({ updatedAt: -1 }).limit(limit).toArray();
}
