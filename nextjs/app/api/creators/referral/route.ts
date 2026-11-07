import { NextResponse } from "next/server";
import { getCreatorByReferral, incrementCreator } from "@/lib/db/collections/creators";

export const runtime = "nodejs";

// Public endpoint to log a referral click. Takes ?code=XYZ and increments
// that creator's referralClicks counter. Idempotency per browser is a
// cookie job — the API is best-effort.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").toUpperCase().trim();
  if (!code) return NextResponse.json({ ok: false, error: "code required" }, { status: 400 });
  const creator = await getCreatorByReferral(code);
  if (!creator) return NextResponse.json({ ok: false, error: "unknown code" }, { status: 404 });
  await incrementCreator(creator.id, { referralClicks: 1 });
  return NextResponse.json({ ok: true });
}
