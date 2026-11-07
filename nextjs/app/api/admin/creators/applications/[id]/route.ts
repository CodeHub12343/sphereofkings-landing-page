import { NextResponse } from "next/server";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";
import {
  CreatorApplicationState, getCreator, updateCreator,
} from "@/lib/db/collections/creators";

export const runtime = "nodejs";

const VALID: CreatorApplicationState[] = ["pending", "approved", "rejected", "suspended"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSessionInfo();
  if (!admin.user) return NextResponse.json({ error: "admin only" }, { status: 403 });
  const { id } = await params;
  const c = await getCreator(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => ({})) as {
    state?: CreatorApplicationState;
    adminNotes?: string;
    flags?: string[];
    verifySocialAccountHandles?: string[];  // "platform:handle" to flip verified=true
  };

  const patch: Parameters<typeof updateCreator>[1] = {};
  if (body.state && VALID.includes(body.state)) patch.state = body.state;
  if (typeof body.adminNotes === "string") patch.adminNotes = body.adminNotes.slice(0, 1000);
  if (Array.isArray(body.flags)) patch.flags = body.flags.slice(0, 20);
  if (Array.isArray(body.verifySocialAccountHandles)) {
    const now = new Date().toISOString();
    patch.socialAccounts = c.socialAccounts.map((s) => {
      const key = `${s.platform}:${s.handle.toLowerCase()}`;
      return body.verifySocialAccountHandles!.includes(key)
        ? { ...s, verified: true, verifiedAt: now }
        : s;
    });
  }
  await updateCreator(id, patch);
  const after = await getCreator(id);
  return NextResponse.json({ creator: after });
}
