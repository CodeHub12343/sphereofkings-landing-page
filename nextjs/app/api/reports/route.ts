import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { createReport } from "@/lib/db/collections/safety-io";
import type { ReportSubject } from "@/lib/db/collections/safety";

export const runtime = "nodejs";

const SUBJECTS: ReportSubject[] = ["player", "message", "match", "conversation", "profile"];
const CATEGORIES = ["harassment", "spam", "cheating", "age", "other"] as const;

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let body: {
    subjectKind?: ReportSubject;
    subjectId?: string;
    reason?: string;
    category?: typeof CATEGORIES[number];
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (!body.subjectKind || !SUBJECTS.includes(body.subjectKind)) {
    return NextResponse.json({ error: "bad subject kind" }, { status: 400 });
  }
  if (!body.subjectId) return NextResponse.json({ error: "subject id required" }, { status: 400 });
  if (!body.reason || body.reason.trim().length < 3) {
    return NextResponse.json({ error: "reason too short" }, { status: 400 });
  }
  if (body.category && !CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "bad category" }, { status: 400 });
  }

  const row = await createReport({
    reporterId: me.id,
    subjectKind: body.subjectKind,
    subjectId: body.subjectId,
    reason: body.reason,
    category: body.category,
  });
  return NextResponse.json({ ok: true, reportId: row.id });
}
