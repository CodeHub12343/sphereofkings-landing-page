import "server-only";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db/mongo";
import { Notification, NotificationKind } from "@/lib/db/collections/safety";
import { broadcast } from "@/lib/realtime/pusher";

const COL = "notifications";

export async function pushNotification(opts: {
  recipientId: string;
  kind: NotificationKind;
  payload: Record<string, string | number | boolean | undefined>;
}): Promise<void> {
  try {
    const db = await getDb();
    const note: Notification = {
      id: randomUUID(),
      recipientId: opts.recipientId,
      kind: opts.kind,
      payload: opts.payload,
      createdAt: new Date().toISOString(),
    };
    await db.collection<Notification>(COL).insertOne(note);
    // The bell polls every 20s and also listens on this per-user
    // channel for low-latency delivery.
    await broadcast(`user-${opts.recipientId}`, "notification", { kind: opts.kind });
  } catch (err) {
    console.warn("pushNotification failed:", err instanceof Error ? err.message : err);
  }
}

export async function listNotifications(recipientId: string, onlyUnread = false): Promise<Notification[]> {
  const db = await getDb();
  const q: Record<string, unknown> = { recipientId };
  if (onlyUnread) q.readAt = { $exists: false };
  return db.collection<Notification>(COL)
    .find(q, { projection: { _id: 0 } })
    .sort({ createdAt: -1 }).limit(50).toArray();
}

export async function markAllRead(recipientId: string): Promise<void> {
  const db = await getDb();
  await db.collection<Notification>(COL).updateMany(
    { recipientId, readAt: { $exists: false } },
    { $set: { readAt: new Date().toISOString() } },
  );
}

export async function unreadCount(recipientId: string): Promise<number> {
  const db = await getDb();
  return db.collection<Notification>(COL).countDocuments({ recipientId, readAt: { $exists: false } });
}
