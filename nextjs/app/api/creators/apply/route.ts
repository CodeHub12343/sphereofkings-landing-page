import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  Creator, ensureCreatorIndexes, getCreatorByPlayerId, insertCreator, tierFor,
} from "@/lib/db/collections/creators";

export const runtime = "nodejs";

interface Body {
  country?: string;
  contentCategory?: string;
  socialAccounts?: {
    platform: "tiktok" | "instagram" | "facebook" | "youtube";
    handle: string;
    url: string;
    followers: number;
  }[];
  agreementVersion?: string;
}

function makeReferralCode(username: string): string {
  const slug = username.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug || "SOK"}${rand}`;
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "sign in first" }, { status: 401 });
  await ensureCreatorIndexes();

  const existing = await getCreatorByPlayerId(me.id);
  if (existing) return NextResponse.json({ error: "already applied", creator: existing }, { status: 409 });

  let body: Body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const country = (body.country ?? "").toUpperCase().trim();
  if (country.length !== 2) return NextResponse.json({ error: "country ISO-2 required" }, { status: 400 });
  const category = (body.contentCategory ?? "").slice(0, 60).trim();
  if (!category) return NextResponse.json({ error: "contentCategory required" }, { status: 400 });
  if (!Array.isArray(body.socialAccounts) || body.socialAccounts.length === 0)
    return NextResponse.json({ error: "at least one social account required" }, { status: 400 });

  const socialAccounts = body.socialAccounts.slice(0, 4).map((s) => ({
    platform: s.platform,
    handle: (s.handle ?? "").replace(/^@/, "").slice(0, 60),
    url: (s.url ?? "").slice(0, 300),
    followers: Math.max(0, Math.floor(Number(s.followers) || 0)),
    verified: false,
  }));

  const now = new Date().toISOString();
  const row: Creator = {
    id: me.id, playerId: me.id,
    playerUsername: me.username, email: me.emailLower,
    displayName: me.displayName,
    country, contentCategory: category,
    socialAccounts,
    state: "pending",
    tier: tierFor(0),
    agreementsAccepted: body.agreementVersion
      ? [{ version: body.agreementVersion, acceptedAt: now }] : [],
    referralCode: makeReferralCode(me.username),
    referralClicks: 0,
    referralConversions: 0,
    lifetimeProductsEarned: 0,
    lifetimePostsApproved: 0,
    creditsBalance: 0,
    flags: [],
    createdAt: now, updatedAt: now,
  };
  await insertCreator(row);
  return NextResponse.json({ creator: row });
}
