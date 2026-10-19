import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

export type ConsentMechanism = "micro-charge" | "manual-admin";
export type ConsentStatus = "pending" | "granted" | "revoked" | "expired";

/** The audit trail for every parental-consent event (ADR-0006). */
export interface PlayerConsent {
  _id?: ObjectId;
  playerId: string;
  parentEmail: string;
  mechanism: ConsentMechanism;
  status: ConsentStatus;
  // Stripe refs — present only for micro-charge consent.
  stripeChargeId?: string;
  stripeRefundId?: string;
  token: string;         // one-time token sent to the parent's email
  tokenExpiresAt: string;
  requestedAt: string;
  grantedAt?: string;
  revokedAt?: string;
  // Account summary digest the parent saw, snapshotted.
  digest: string;
}

export interface Conversation {
  _id?: ObjectId;
  id: string;                     // uuid
  participantIds: string[];       // length 2 at launch; group DMs are Phase 9
  participantUsernames: string[]; // mirrored for cheap listing
  participantDisplayNames: string[];
  // A conversation is "accepted" once the recipient opens it or
  // sends a reply. Before that the recipient can decline it, which
  // archives the conversation (both sides).
  status: "pending" | "accepted" | "archived" | "blocked";
  // Both sides may toggle muting. muted[playerId] = true suppresses
  // notifications for that side; the conversation still exists.
  muted: Record<string, boolean>;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  _id?: ObjectId;
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  moderationStatus: "clean" | "flagged" | "blocked";
  moderationReason?: string;
  // Optional provider score (Perspective API toxicity 0..1).
  moderationScore?: number;
}

export type NotificationKind =
  | "challenge-received"
  | "match-your-turn"
  | "match-ended"
  | "message-received"
  | "consent-granted"
  | "report-resolved"
  | "tournament-starting";

export interface Notification {
  _id?: ObjectId;
  id: string;
  recipientId: string;
  kind: NotificationKind;
  // Opaque small payload — enough to construct a click-through link.
  payload: Record<string, string | number | boolean | undefined>;
  createdAt: string;
  readAt?: string;
}

export type ReportSubject = "player" | "message" | "match" | "conversation" | "profile";

export interface ModerationReport {
  _id?: ObjectId;
  id: string;
  reporterId: string;
  subjectKind: ReportSubject;
  subjectId: string;
  reason: string;              // free-text, 1..500
  category?: "harassment" | "spam" | "cheating" | "age" | "other";
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution?: "no-action" | "warning" | "suspension" | "ban";
  resolvedByAdminId?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export async function ensureSafetyIndexes(): Promise<void> {
  const db = await getDb();
  await Promise.all([
    db.collection<PlayerConsent>("playerConsents").createIndex({ playerId: 1 }),
    db.collection<PlayerConsent>("playerConsents").createIndex({ token: 1 }, { unique: true }),
    db.collection<Conversation>("conversations").createIndex({ id: 1 }, { unique: true }),
    db.collection<Conversation>("conversations").createIndex({ participantIds: 1, lastMessageAt: -1 }),
    db.collection<Message>("messages").createIndex({ conversationId: 1, createdAt: -1 }),
    db.collection<Notification>("notifications").createIndex({ recipientId: 1, readAt: 1, createdAt: -1 }),
    db.collection<ModerationReport>("moderationReports").createIndex({ status: 1, createdAt: -1 }),
    db.collection<ModerationReport>("moderationReports").createIndex({ subjectKind: 1, subjectId: 1 }),
  ]);
}
