import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  ensureReferralIndexes, recordEvent,
} from "@/lib/db/collections/referrals";
import { hashIp, hashVisitor, newCookieId, verifyEvent } from "@/lib/sweepstakes";
import { flag } from "@/lib/feature-flags";
import { getDb } from "@/lib/db/mongo";

export const runtime = "nodejs";

const VISITOR_COOKIE = "sok_vid";

/**
 * Alternative Method of Entry (AMOE). US sweepstakes law requires a
 * free entry path with equal odds that doesn't require sharing or
 * purchasing. Body:
 *   { fullName, email, mailingAddress, state }
 *
 * Not open until the feature flag is enabled by an admin AFTER the
 * official rules + eligibility have been reviewed by counsel.
 */
export async function POST(req: Request) {
  if (!flag("sweepstakesEntries")) {
    return NextResponse.json(
      { error: "Sweepstakes entries are not yet open. Please check back when the official rules are posted." },
      { status: 503 },
    );
  }

  let body: {
    fullName?: string; email?: string; mailingAddress?: string; state?: string;
    age13Plus?: boolean; agreeRules?: boolean;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const required = ["fullName", "email", "mailingAddress", "state"] as const;
  for (const k of required) {
    if (!body[k] || String(body[k]).trim().length < 2) {
      return NextResponse.json({ error: `${k} required` }, { status: 400 });
    }
  }
  if (!body.age13Plus) return NextResponse.json({ error: "Must be 13+" }, { status: 400 });
  if (!body.agreeRules) return NextResponse.json({ error: "Must agree to official rules" }, { status: 400 });

  const email = body.email!.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  await ensureReferralIndexes().catch(() => {});
  const jar = await cookies();
  const h = await headers();
  let vid = jar.get(VISITOR_COOKIE)?.value;
  if (!vid) {
    vid = newCookieId();
    jar.set(VISITOR_COOKIE, vid, {
      httpOnly: true, sameSite: "lax", path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  const visitorHash = hashVisitor(vid);
  const ipHash = hashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"));
  const userAgent = h.get("user-agent") ?? "";

  const verdict = await verifyEvent(
    { code: "AMOE", visitorHash, ipHash, userAgent, attributedPlayerId: undefined },
    "amoe",
  );

  // Persist the mailing address as its own doc so winners can be
  // notified via post if email delivery fails (legally required
  // backup under some state statutes).
  try {
    const db = await getDb();
    await db.collection("sweepstakesAmoeEntries").insertOne({
      email,
      fullName: body.fullName!.trim(),
      mailingAddress: body.mailingAddress!.trim(),
      state: body.state!.trim().toUpperCase().slice(0, 2),
      createdAt: new Date().toISOString(),
      visitorHash, ipHash,
      verified: verdict.verified,
      reason: verdict.reason,
    });
  } catch {}

  await recordEvent({
    code: "AMOE",
    kind: "amoe",
    visitorHash, ipHash,
    verified: verdict.verified,
    reason: verdict.reason,
  });

  return NextResponse.json({
    ok: true,
    verified: verdict.verified,
    message: verdict.verified
      ? "Entry received. You are entered in the next drawing round that opens after this entry."
      : "Entry received, but it has been flagged for manual review and may not qualify.",
  });
}
