import { NextResponse } from "next/server";
import { ensureCreationIndexes, listMarketplace } from "@/lib/db/collections/creation-designs";

export const runtime = "nodejs";

export async function GET(req: Request) {
  await ensureCreationIndexes();
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag") ?? undefined;
  const items = await listMarketplace(60, tag ?? undefined);
  return NextResponse.json({ items });
}
