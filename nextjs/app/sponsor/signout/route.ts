import { NextRequest, NextResponse } from "next/server";
import { SPONSOR_SESSION_COOKIE } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/sponsor/signin";
  url.search = "";
  const res = NextResponse.redirect(url, 302);
  res.cookies.delete(SPONSOR_SESSION_COOKIE);
  return res;
}
