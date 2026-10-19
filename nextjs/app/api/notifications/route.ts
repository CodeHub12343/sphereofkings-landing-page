import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { listNotifications, markAllRead, unreadCount } from "@/lib/notifications";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const url = new URL(req.url);
  const onlyUnread = url.searchParams.get("unread") === "1";
  const [items, unread] = await Promise.all([
    listNotifications(me.id, onlyUnread),
    unreadCount(me.id),
  ]);
  return NextResponse.json({ notifications: items, unread });
}

export async function POST(_req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  await markAllRead(me.id);
  return NextResponse.json({ ok: true });
}
