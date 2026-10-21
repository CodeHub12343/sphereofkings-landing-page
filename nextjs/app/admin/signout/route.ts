// Admin signout.
//
// This route MUST be a no-op for prefetch and RSC requests. Next.js
// prefetches every <Link> on the page by default; if the AdminHeader's
// "Sign out" link is prefetched (which happens on every admin page
// load), a GET to this route would wipe the live session cookie before
// the user ever clicks sign-out. That caused the admin redirect loop
// where the dashboard loaded fine, then every subsequent nav link
// bounced back to /admin/signin.
//
// Behaviour:
//   - Prefetch / RSC GET  -> 204 No Content, no cookie change.
//   - Real top-level GET  -> delete cookie, redirect to /admin/signin.
//   - POST (form submit)  -> same as a real GET.

import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/token";

function isBackgroundRequest(req: NextRequest): boolean {
  return (
    req.headers.get("next-router-prefetch") === "1" ||
    req.headers.get("purpose") === "prefetch" ||
    (req.headers.get("sec-purpose") ?? "").includes("prefetch") ||
    req.headers.get("rsc") === "1" ||
    req.headers.get("next-router-state-tree") !== null &&
      req.headers.get("sec-fetch-dest") !== "document"
  );
}

async function doSignOut() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/signin");
}

export async function GET(req: NextRequest) {
  if (isBackgroundRequest(req)) {
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  }
  await doSignOut();
}

export async function POST(req: NextRequest) {
  if (isBackgroundRequest(req)) {
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  }
  await doSignOut();
}
