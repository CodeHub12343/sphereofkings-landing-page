import { NextRequest, NextResponse } from "next/server";

// Guards the /admin area with HTTP Basic auth.
//
// Credentials come from ADMIN_USER and ADMIN_PASSWORD environment variables.
// If either is missing we fail closed with a clear 503 — never let the admin
// through without a password, even by accident.
//
// This is a stopgap. Replace with a real auth system (sessions, roles,
// per-user accounts) before onboarding more than one operator.
export function middleware(req: NextRequest) {
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
      // malformed — fall through to 401
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
      "WWW-Authenticate": 'Basic realm="Sphere of Kings admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

// Length-aware constant-time string compare. Avoids leaking the password
// length via early-exit. Edge runtime has no Buffer or crypto.timingSafeEqual.
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
  // Guard every /admin route and any nested sub-path. Public routes
  // (/, /shop, /donate, /wholesale, /checkout) are untouched.
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
      <p>Set <code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code> in your environment, then redeploy. See <code>.env.example</code> for the keys.</p>
      <p>Until that is done, the admin area is intentionally locked — never served without a password, even by accident.</p>
      <p><a href="/">← Back to the public site</a></p>
    </main>
  </body>
</html>`;
