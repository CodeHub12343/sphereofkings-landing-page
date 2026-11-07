import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreatorByPlayerId, incrementCreator, updateCreator } from "@/lib/db/collections/creators";
import {
  CreditEntry, ensureCreditIndexes, insertRedemption, recordEntry,
  Redemption, REWARD_CATALOG, sumBalance,
} from "@/lib/db/collections/creator-credits";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const creator = await getCreatorByPlayerId(me.id);
  if (!creator) return NextResponse.json({ error: "no creator profile" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as {
    sku?: string;
    shippingAddress?: Redemption["shippingAddress"];
  };
  const product = REWARD_CATALOG.find((p) => p.sku === body.sku);
  if (!product) return NextResponse.json({ error: "unknown sku" }, { status: 400 });
  if (product.inventory <= 0) return NextResponse.json({ error: "out of stock" }, { status: 409 });
  if (!product.internationalEligible && (body.shippingAddress?.country ?? "US").toUpperCase() !== "US")
    return NextResponse.json({ error: "this reward ships to the US only" }, { status: 400 });

  const s = (body.shippingAddress ?? {}) as Partial<NonNullable<Redemption["shippingAddress"]>>;
  for (const f of ["name", "line1", "city", "region", "postalCode", "country"] as const) {
    const v = s[f];
    if (!v || String(v).trim().length < 1)
      return NextResponse.json({ error: `shippingAddress.${f} required` }, { status: 400 });
  }

  await ensureCreditIndexes();
  const balance = await sumBalance(creator.id);
  if (balance < product.credits)
    return NextResponse.json({ error: "insufficient credits" }, { status: 400 });

  const redemptionId = randomUUID();
  const redemption: Redemption = {
    id: redemptionId, creatorId: creator.id,
    productSku: product.sku, productLabel: product.label,
    creditsSpent: product.credits,
    shippingAddress: s as Redemption["shippingAddress"],
    status: "reserved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await insertRedemption(redemption);

  const entry: CreditEntry = {
    id: randomUUID(), creatorId: creator.id,
    kind: "redeem", delta: -product.credits,
    balanceAfter: balance - product.credits,
    idempotencyKey: `redemption:${redemptionId}`,
    redemptionId,
    note: product.label,
    createdAt: new Date().toISOString(),
  };
  const r = await recordEntry(entry);
  if (r === "duplicate")
    return NextResponse.json({ error: "duplicate redemption" }, { status: 409 });

  await updateCreator(creator.id, { creditsBalance: entry.balanceAfter });
  await incrementCreator(creator.id, { lifetimeProductsEarned: 1 });

  // Decrement inventory in memory (persist in product catalog later).
  product.inventory -= 1;
  return NextResponse.json({ redemption });
}
