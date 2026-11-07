import { NextResponse } from "next/server";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import {
  getRedemption, listAllRedemptions, Redemption, updateRedemption,
} from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const redemptions = await listAllRedemptions();
  return NextResponse.json({ redemptions });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const { id } = await params;
  const r = await getRedemption(id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json().catch(() => ({})) as Partial<Redemption>;
  const patch: Partial<Redemption> = {};
  if (body.status) patch.status = body.status;
  if (body.trackingCarrier) patch.trackingCarrier = body.trackingCarrier.slice(0, 40);
  if (body.trackingNumber) patch.trackingNumber = body.trackingNumber.slice(0, 80);
  await updateRedemption(id, patch);
  const after = await getRedemption(id);
  return NextResponse.json({ redemption: after });
}
