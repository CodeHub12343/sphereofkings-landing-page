import { NextResponse } from "next/server";
import { recordPuzzleRun } from "@/lib/db/collections/puzzles";
import type { PuzzleGame, PuzzleTier } from "@/lib/games/puzzles/official";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: {
    anonymousSessionId?: string;
    slug?: string;
    game?: PuzzleGame;
    tier?: PuzzleTier;
    solved?: boolean;
    timeMs?: number;
    attempts?: number;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const required = ["anonymousSessionId", "slug", "game", "tier"] as const;
  for (const k of required) {
    if (!body[k]) return NextResponse.json({ error: `missing ${k}` }, { status: 400 });
  }

  await recordPuzzleRun({
    anonymousSessionId: body.anonymousSessionId!,
    slug: body.slug!,
    game: body.game!,
    tier: body.tier!,
    solved: !!body.solved,
    timeMs: Math.max(0, Math.round(body.timeMs ?? 0)),
    attempts: Math.max(1, Math.round(body.attempts ?? 1)),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
