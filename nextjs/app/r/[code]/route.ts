import { NextRequest, NextResponse } from "next/server";
import {
  AFF_ATTR_COOKIE,
  AFF_FIRST_COOKIE,
  AFF_TOUCHES_COOKIE,
  AFF_ATTR_MAX_AGE_SECONDS,
  appendTouch,
  encodeAttrCookie,
  encodeTouchesCookie,
  parseAttrCookie,
  parseTouchesCookie,
} from "@/lib/affiliate-auth";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";

// Needs Node (not Edge) because it hits Mongo to look the code up.
export const runtime = "nodejs";

// /r/[code] — the public referral entry point. Validates the code and
// drops the attribution cookie, then 302s to the destination. Unknown or
// suspended codes still redirect (so a mis-shared link still works for
// the customer), but no cookie is set.
//
// Open-redirect safe: `?to=` is honored only when it is a relative,
// single-slash path.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const to = req.nextUrl.searchParams.get("to") ?? "/shop";
  const dest = isSafeInternalPath(to) ? to : "/shop";
  const url = new URL(dest, req.nextUrl.origin);

  const upper = decodeURIComponent(code).trim().toUpperCase();
  // Mongo lookup — recognises both the seeded sample affiliates and
  // self-signup codes (SOV-xxx-xxxx) created via /affiliate/apply.
  const found = await findAffiliateByCode(upper).catch(() => undefined);
  const eligible = found && found.state === "active";

  const res = NextResponse.redirect(url, 302);
  res.headers.set("Cache-Control", "no-store");

  if (eligible) {
    const nowISO = new Date().toISOString();
    const previousLast = parseAttrCookie(
      req.cookies.get(AFF_ATTR_COOKIE)?.value ?? "",
    );
    // Preserve the LAST-TOUCH timestamp on repeat clicks for the same
    // code so the window can't be reset by clicking the link again.
    const lastClickISO =
      previousLast && previousLast.code === upper
        ? previousLast.firstClickISO
        : nowISO;
    res.cookies.set(AFF_ATTR_COOKIE, encodeAttrCookie(upper, lastClickISO), {
      maxAge: AFF_ATTR_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    });

    // First-touch cookie — only write it when it isn't already set.
    // That makes it genuinely "first touch" across the shopper's whole
    // 30-day journey, even if they click different affiliate links.
    const firstTouch = parseAttrCookie(
      req.cookies.get(AFF_FIRST_COOKIE)?.value ?? "",
    );
    if (!firstTouch) {
      res.cookies.set(
        AFF_FIRST_COOKIE,
        encodeAttrCookie(upper, nowISO),
        {
          maxAge: AFF_ATTR_MAX_AGE_SECONDS,
          sameSite: "lax",
          path: "/",
        },
      );
    }

    // Touches cookie — ordered history (oldest-first) of unique codes
    // the shopper has clicked. Powers linear + u-shape attribution.
    const previousTouches = parseTouchesCookie(
      req.cookies.get(AFF_TOUCHES_COOKIE)?.value ?? "",
    );
    const nextTouches = appendTouch(previousTouches, upper, nowISO);
    res.cookies.set(
      AFF_TOUCHES_COOKIE,
      encodeTouchesCookie(nextTouches),
      {
        maxAge: AFF_ATTR_MAX_AGE_SECONDS,
        sameSite: "lax",
        path: "/",
      },
    );
  }
  return res;
}

function isSafeInternalPath(p: string): boolean {
  if (typeof p !== "string") return false;
  if (!p.startsWith("/")) return false;
  // Reject //example.com style open-redirects and protocol-relative URLs.
  if (p.startsWith("//")) return false;
  // Reject anything that smells like a scheme.
  if (/^\/\\?/.test(p)) return false;
  return true;
}
