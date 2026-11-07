import { NextResponse } from "next/server";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import {
  ensureCreatorIndexes, listCreatorsByState,
} from "@/lib/db/collections/creators";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  await ensureCreatorIndexes();
  const url = new URL(req.url);
  const state = url.searchParams.get("state") as "pending" | "approved" | "rejected" | "suspended" | null;
  const creators = await listCreatorsByState(state ?? undefined);
  return NextResponse.json({ creators });
}
