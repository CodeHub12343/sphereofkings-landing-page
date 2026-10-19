import { NextResponse } from "next/server";
import { listPuzzles } from "@/lib/db/collections/puzzles";
import type { PuzzleGame, PuzzleTier } from "@/lib/games/puzzles/official";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const game = url.searchParams.get("game") as PuzzleGame | null;
  const tier = url.searchParams.get("tier") as PuzzleTier | null;
  const puzzles = await listPuzzles({
    game: game ?? undefined,
    tier: tier ?? undefined,
  });
  return NextResponse.json({ puzzles });
}
