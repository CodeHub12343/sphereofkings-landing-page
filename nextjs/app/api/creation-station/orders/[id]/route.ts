import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import {
  CreationOrderStatus, getCreationOrder, transitionCreationOrder,
} from "@/lib/db/collections/creation-orders";

export const runtime = "nodejs";

const ALLOWED: CreationOrderStatus[] = [
  "pending-payment", "paid", "queued", "printing", "qa", "shipped", "delivered", "cancelled", "refunded",
];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  const admin = await getAdminSessionInfo().catch(() => null);
  const { id } = await params;
  const o = await getCreationOrder(id);
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!admin?.user && (!me || me.id !== o.playerId))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ order: o });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { status?: string; note?: string };
  if (!body.status || !ALLOWED.includes(body.status as CreationOrderStatus))
    return NextResponse.json({ error: "bad status" }, { status: 400 });
  await transitionCreationOrder(id, body.status as CreationOrderStatus, body.note);
  const o = await getCreationOrder(id);
  return NextResponse.json({ order: o });
}
