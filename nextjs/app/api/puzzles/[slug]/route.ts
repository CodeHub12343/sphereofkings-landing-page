import { NextResponse } from "next/server";
import { getPuzzle } from "@/lib/db/collections/puzzles";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const puzzle = await getPuzzle(slug);
  if (!puzzle) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ puzzle });
}
