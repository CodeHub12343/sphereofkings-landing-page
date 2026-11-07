import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId, updateCreator } from "@/lib/db/collections/creators";

export const runtime = "nodejs";

// Add / replace / mark-verified social accounts. The verification step is
// manual by default: an admin flips `verified=true` in the admin queue
// after reviewing proof. OAuth-based verification plugs into the same
// endpoint by calling PATCH with { verified: true } after the OAuth flow.
export async function PATCH(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ error: "no creator profile" }, { status: 404 });

  const body = await req.json().catch(() => ({})) as {
    socialAccounts?: typeof creator.socialAccounts;
  };
  if (!Array.isArray(body.socialAccounts))
    return NextResponse.json({ error: "socialAccounts array required" }, { status: 400 });

  const cleaned = body.socialAccounts.slice(0, 4).map((s) => ({
    platform: s.platform,
    handle: (s.handle ?? "").replace(/^@/, "").slice(0, 60),
    url: (s.url ?? "").slice(0, 300),
    followers: Math.max(0, Math.floor(Number(s.followers) || 0)),
    // Creators can't self-verify. Preserve the existing verified flag
    // when a matching (platform, handle) pair already exists.
    verified: creator.socialAccounts.find(
      (x) => x.platform === s.platform && x.handle.toLowerCase() === (s.handle ?? "").replace(/^@/, "").toLowerCase(),
    )?.verified ?? false,
  }));
  await updateCreator(creator.id, { socialAccounts: cleaned });
  return NextResponse.json({ ok: true });
}
