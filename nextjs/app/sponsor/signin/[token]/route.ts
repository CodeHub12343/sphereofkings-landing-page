import { NextRequest, NextResponse } from "next/server";
import {
  consumeMagicLink,
  findSponsorshipByMagicToken,
} from "@/lib/db/collections/sponsorships";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  SPONSOR_SESSION_COOKIE,
  SPONSOR_SESSION_TTL_SECONDS,
  createSessionToken,
} from "@/lib/auth/token";

// Magic-link consume endpoint. Reads the token, validates it (exists,
// not expired, not already consumed, sponsorship is paid), marks the
// token consumed so it can't be replayed, mints a sponsor-kind session
// cookie, and redirects to /sponsor. On any validation failure we
// redirect to /sponsor/signin with an error flag — never leak which
// branch tripped.
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const base = _req.nextUrl.clone();
  const fail = (code: "expired" | "invalid" | "no-match") => {
    base.pathname = "/sponsor/signin";
    base.search = `?error=${code}`;
    return NextResponse.redirect(base, 302);
  };

  const row = await findSponsorshipByMagicToken(token);
  if (!row || !row.magicLink) return fail("invalid");
  if (row.magicLink.consumedISO) return fail("invalid");
  if (new Date(row.magicLink.expiresISO).getTime() < Date.now())
    return fail("expired");
  if (row.state !== "paid") return fail("no-match");

  await consumeMagicLink(row.ref).catch(() => {});
  const session = await createSessionToken({
    kind: "sponsor",
    id: row.ref,
    ttlSeconds: SPONSOR_SESSION_TTL_SECONDS,
  });

  base.pathname = "/sponsor";
  base.search = "";
  const res = NextResponse.redirect(base, 302);
  res.cookies.set(SPONSOR_SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SPONSOR_SESSION_TTL_SECONDS,
  });
  await recordAuditEvent({
    actor: { kind: "system" },
    action: "sponsor.signin",
    target: { collection: "sponsorships", id: row.ref },
    summary: `Sponsor signed in via magic link`,
    details: { ref: row.ref, contactEmail: row.contactEmail },
  }).catch(() => {});
  return res;
}
