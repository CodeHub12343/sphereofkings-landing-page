import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  ensureReferralIndexes, findCode, recordEvent,
} from "@/lib/db/collections/referrals";
import { hashVisitor, hashIp, newCookieId } from "@/lib/sweepstakes";

export const runtime = "nodejs";

const COOKIE_NAME = "sok_ref";
const VISITOR_COOKIE = "sok_vid";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * /r/<code> — referral landing. Sets a 30-day cookie carrying the
 * referral code, logs the click, then 302 to the home page. Signups
 * that happen while this cookie is set are attributed to the code.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const jar = await cookies();
  const h = await headers();

  await ensureReferralIndexes().catch(() => {});

  const row = await findCode(code).catch(() => null);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "/";
  if (!row || !row.active) {
    return NextResponse.redirect(new URL("/", site));
  }

  // Visitor id — stable per-browser cookie used for de-duplication.
  let vid = jar.get(VISITOR_COOKIE)?.value;
  if (!vid) {
    vid = newCookieId();
    jar.set(VISITOR_COOKIE, vid, {
      httpOnly: true, sameSite: "lax", path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    });
  }
  // Attribution cookie — scoped to the one code.
  jar.set(COOKIE_NAME, row.code, {
    httpOnly: false, // non-sensitive and we check it on the client at times
    sameSite: "lax", path: "/",
    maxAge: COOKIE_TTL_SECONDS,
  });

  // Log the click. Verification happens at the conversion step; clicks
  // are always recorded for admin visibility.
  await recordEvent({
    code: row.code,
    kind: "click",
    visitorHash: hashVisitor(vid),
    ipHash: hashIp(h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip")),
    userAgentHash: undefined,
    verified: false,
    reason: "click",
    attributedPlayerId: row.playerId,
  }).catch(() => {});

  return NextResponse.redirect(new URL("/", site));
}
