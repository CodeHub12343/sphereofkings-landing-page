import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { validateGrid } from "@/lib/sphere-grid";
import { priceCreation } from "@/lib/creation-station/pricing";
import { defaultConfig, CreationConfig } from "@/lib/db/collections/creation-designs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let body: { grid?: unknown; config?: Partial<CreationConfig>; country?: string; royaltyBps?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  let grid: string[][];
  try { grid = validateGrid(body.grid); } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "bad grid" }, { status: 400 });
  }
  const config = { ...defaultConfig(), ...(body.config ?? {}) } as CreationConfig;
  const pricing = priceCreation(grid, config, {
    country: body.country, royaltyBps: body.royaltyBps,
  });
  return NextResponse.json({ pricing });
}
