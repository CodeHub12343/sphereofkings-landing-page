// Server-side AI backup for the Hard tier. Low-end clients can offload
// here instead of blocking the main thread for 2.5s.

import { NextResponse } from "next/server";
import { chooseMove, Difficulty } from "@/lib/games/royal-checkers/ai";
import { decode, encode, apply } from "@/lib/games/royal-checkers/engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { state?: string; difficulty?: Difficulty };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.state || !body.difficulty) {
    return NextResponse.json({ error: "state and difficulty required" }, { status: 400 });
  }
  if (!["easy", "medium", "hard"].includes(body.difficulty)) {
    return NextResponse.json({ error: "unknown difficulty" }, { status: 400 });
  }
  let state;
  try {
    state = decode(body.state);
  } catch {
    return NextResponse.json({ error: "bad state" }, { status: 400 });
  }
  const move = chooseMove(state, body.difficulty);
  if (!move) {
    return NextResponse.json({ error: "no legal moves" }, { status: 409 });
  }
  const next = apply(state, move);
  return NextResponse.json({ move, state: encode(next) });
}
