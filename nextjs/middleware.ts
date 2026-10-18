import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/token";

// Dual-mode admin gate.
//
//   1. When MONGODB_URI is set (production path): /admin/* is gated by
//      the signed admin session cookie set by /admin/signin. No cookie
//      or a bad/expired/forged one → 302 to the signin page. The sign-
//      in page and sign-out route are always allowed through so people
//      can get in.
//
//   2. When MONGODB_URI is not set (dev fallback): HTTP Basic prompt
//      using ADMIN_USER / ADMIN_PASSWORD, same as before. This keeps
//      laptop development usable without spinning up Mongo.
//
// Middleware runs on the Edge runtime, so neither Node crypto nor the
// Mongo driver is available here. We only verify the cookie's HMAC —
// the real session lookup, if any, happens in server components.

const hasMongo = typeof process.env.MONGODB_URI === "string" &&
  process.env.MONGODB_URI.length > 0;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The signin and signout endpoints must always be reachable so an
  // admin who has no cookie can get in or clear a bad one.
  if (
    pathname === "/admin/signin" ||
    pathname.startsWith("/admin/signin/") ||
    pathname === "/admin/signout" ||
    pathname.startsWith("/admin/signout/")
  ) {
    return NextResponse.next();
  }

  if (hasMongo) {
    const cookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await readSessionToken(cookie, "admin").catch(() => null);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/signin";
      url.search = "";
      const res = NextResponse.redirect(url, 302);
      res.headers.set("Cache-Control", "no-store");
      // Scrub a bad cookie so the signin page doesn't bounce back.
      if (cookie) res.cookies.delete(ADMIN_SESSION_COOKIE);
      return res;
    }
    return NextResponse.next();
  }

  // ---- Dev fallback: HTTP Basic ----
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return new NextResponse(ADMIN_NOT_CONFIGURED_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      /* fall through to 401 */
    }
    const sep = decoded.indexOf(":");
    if (sep > -1) {
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (
        timingSafeEqual(user, expectedUser) &&
        timingSafeEqual(pass, expectedPassword)
      ) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Sphere of Kings admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

const ADMIN_NOT_CONFIGURED_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Admin not configured — Sphere of Kings</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <style>
      body { margin: 0; min-height: 100vh; background: #0a0a0a; color: #f5f0e8; display: grid; place-items: center; font-family: Inter, system-ui, sans-serif; padding: 24px; }
      .card { max-width: 520px; background: #0e0c09; border: 1px solid #e0a94a; border-radius: 14px; padding: 28px; }
      h1 { font-family: 'Cinzel', Georgia, serif; margin: 0 0 10px; font-size: 1.4rem; color: #e0a94a; }
      p { line-height: 1.55; color: #a89880; font-size: 0.92rem; margin: 0 0 10px; }
      code { background: #1a1612; color: #f0c040; padding: 2px 8px; border-radius: 4px; font-family: SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.85rem; }
      a { color: #f0c040; }
    </style>
  </head>
  <body>
    <main class="card" role="alert">
      <h1>Admin not configured</h1>
      <p>Set <code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code> in your environment (dev fallback), or set <code>MONGODB_URI</code> + <code>SESSION_SECRET</code> for per-account sign-in, then redeploy.</p>
      <p><a href="/">← Back to the public site</a></p>
    </main>
  </body>
</html>`;
