import { NextResponse } from "next/server";
import { REWARD_CATALOG } from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ catalog: REWARD_CATALOG });
}
