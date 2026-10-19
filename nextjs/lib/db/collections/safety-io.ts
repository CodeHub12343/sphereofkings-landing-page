import "server-only";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/mongo";
import {
  Conversation, Message, ModerationReport, ReportSubject,
  PlayerConsent, ConsentMechanism,
} from "./safety";

/* ----------------------------- Consent ----------------------------- */

export async function startConsentRequest(opts: {
  playerId: string;
  parentEmail: string;
  digest: string;
  mechanism?: ConsentMechanism;
}): Promise<PlayerConsent> {
  const db = await getDb();
  const row: PlayerConsent = {
    playerId: opts.playerId,
    parentEmail: opts.parentEmail,
    mechanism: opts.mechanism ?? "micro-charge",
    status: "pending",
    token: randomUUID() + "-" + Math.random().toString(36).slice(2, 10),
    tokenExpiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    requestedAt: new Date().toISOString(),
    digest: opts.digest,
  };
  await db.collection<PlayerConsent>("playerConsents").insertOne(row);
  return row;
}

export async function consentByToken(token: string): Promise<PlayerConsent | null> {
  const db = await getDb();
  return db.collection<PlayerConsent>("playerConsents").findOne(
    { token }, { projection: { _id: 0 } },
  );
}

export async function grantConsent(
  token: string, opts: { chargeId?: string; refundId?: string; mechanism?: ConsentMechanism },
): Promise<PlayerConsent | null> {
  const db = await getDb();
  await db.collection<PlayerConsent>("playerConsents").updateOne(
    { token }, {
      $set: {
        status: "granted",
        grantedAt: new Date().toISOString(),
        stripeChargeId: opts.chargeId,
        stripeRefundId: opts.refundId,
        ...(opts.mechanism ? { mechanism: opts.mechanism } : {}),
      },
    });
  return consentByToken(token);
}

/* --------------------------- Messaging ----------------------------- */

export async function findOrCreateConversation(opts: {
  initiatorId: string; initiatorUsername: string; initiatorDisplayName: string;
  otherId: string; otherUsername: string; otherDisplayName: string;
}): Promise<Conversation> {
  const db = await getDb();
  const pair = [opts.initiatorId, opts.otherId].sort();
  const existing = await db.collection<Conversation>("conversations").findOne(
    { participantIds: { $all: pair, $size: 2 } }, { projection: { _id: 0 } },
  );
  if (existing) return existing;
  const now = new Date().toISOString();
  const convo: Conversation = {
    id: randomUUID(),
    participantIds: pair,
    participantUsernames: pair[0] === opts.initiatorId
      ? [opts.initiatorUsername, opts.otherUsername]
      : [opts.otherUsername, opts.initiatorUsername],
    participantDisplayNames: pair[0] === opts.initiatorId
      ? [opts.initiatorDisplayName, opts.otherDisplayName]
      : [opts.otherDisplayName, opts.initiatorDisplayName],
    status: "pending",
    muted: {},
    lastMessageAt: now,
    createdAt: now,
  };
  await db.collection<Conversation>("conversations").insertOne(convo);
  return convo;
}

export async function listConversations(playerId: string): Promise<Conversation[]> {
  const db = await getDb();
  return db.collection<Conversation>("conversations")
    .find({ participantIds: playerId, status: { $ne: "archived" } },
          { projection: { _id: 0 } })
    .sort({ lastMessageAt: -1 }).limit(100).toArray();
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const db = await getDb();
  return db.collection<Conversation>("conversations").findOne({ id }, { projection: { _id: 0 } });
}

export async function updateConversation(id: string, patch: Partial<Conversation>): Promise<void> {
  const db = await getDb();
  await db.collection<Conversation>("conversations").updateOne({ id }, { $set: patch });
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const db = await getDb();
  return db.collection<Message>("messages")
    .find({ conversationId, moderationStatus: { $ne: "blocked" } },
          { projection: { _id: 0 } })
    .sort({ createdAt: 1 }).limit(200).toArray();
}

export async function insertMessage(m: Message): Promise<void> {
  const db = await getDb();
  await db.collection<Message>("messages").insertOne(m);
}

/* --------------------------- Reports ------------------------------- */

export async function createReport(opts: {
  reporterId: string; subjectKind: ReportSubject; subjectId: string;
  reason: string; category?: ModerationReport["category"];
}): Promise<ModerationReport> {
  const db = await getDb();
  const row: ModerationReport = {
    id: randomUUID(),
    reporterId: opts.reporterId,
    subjectKind: opts.subjectKind,
    subjectId: opts.subjectId,
    reason: opts.reason.slice(0, 500),
    category: opts.category,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  await db.collection<ModerationReport>("moderationReports").insertOne(row);
  return row;
}

export async function listReports(status?: ModerationReport["status"]): Promise<ModerationReport[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (status) q.status = status;
  return db.collection<ModerationReport>("moderationReports")
    .find(q, { projection: { _id: 0 } })
    .sort({ status: 1, createdAt: -1 }).limit(200).toArray();
}

export async function resolveReport(id: string, opts: {
  resolution: ModerationReport["resolution"];
  resolvedByAdminId: string;
  resolutionNote?: string;
}): Promise<void> {
  const db = await getDb();
  await db.collection<ModerationReport>("moderationReports").updateOne(
    { id },
    { $set: {
      status: "resolved",
      resolution: opts.resolution,
      resolvedByAdminId: opts.resolvedByAdminId,
      resolutionNote: opts.resolutionNote,
      resolvedAt: new Date().toISOString(),
    } },
  );
}
