import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, Locale } from "@/lib/i18n";

export const runtime = "nodejs";

/** Switch the viewer's locale. Body: { locale: "en" | "es" | ... }. */
export async function POST(req: Request) {
  let body: { locale?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!body.locale || !(SUPPORTED_LOCALES as readonly string[]).includes(body.locale)) {
    return NextResponse.json({ error: "unsupported locale" }, { status: 400 });
  }
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, body.locale as Locale, {
    httpOnly: false, // the client picker reads it
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ ok: true });
}
