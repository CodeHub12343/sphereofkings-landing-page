import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { currentPlayer } from "@/lib/auth/player-session";
import { getCreation } from "@/lib/db/collections/creation-designs";
import {
  CreationOrder, ensureCreationOrderIndexes, insertCreationOrder,
  listCreationOrdersFor,
} from "@/lib/db/collections/creation-orders";
import { priceCreation } from "@/lib/creation-station/pricing";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  await ensureCreationOrderIndexes();
  const orders = await listCreationOrdersFor(me.id);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let body: {
    creationId?: string;
    quantity?: number;
    shipping?: {
      name?: string; line1?: string; line2?: string;
      city?: string; region?: string; postalCode?: string; country?: string;
    };
    giftMessage?: string;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.creationId) return NextResponse.json({ error: "creationId required" }, { status: 400 });
  const s = body.shipping ?? {};
  for (const f of ["name", "line1", "city", "region", "postalCode", "country"] as const) {
    if (!s[f] || String(s[f]).trim().length < 1) {
      return NextResponse.json({ error: `shipping.${f} required` }, { status: 400 });
    }
  }
  const country = s.country!.trim().toUpperCase();
  if (country.length !== 2) return NextResponse.json({ error: "country must be ISO alpha-2" }, { status: 400 });

  const creation = await getCreation(body.creationId);
  if (!creation) return NextResponse.json({ error: "creation not found" }, { status: 404 });
  const buyerIsCreator = creation.playerId === me.id;
  if (!buyerIsCreator && !creation.isPublic)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (creation.moderationState === "blocked")
    return NextResponse.json({ error: "creation blocked by moderation" }, { status: 403 });

  const pricing = priceCreation(creation.grid, creation.config, {
    quantity: body.quantity, country,
    royaltyBps: buyerIsCreator ? 0 : creation.royaltyBps,
  });

  await ensureCreationOrderIndexes();
  const id = randomUUID();
  const now = new Date().toISOString();
  const order: CreationOrder = {
    id, playerId: me.id, playerUsername: me.username,
    creationId: creation.id, creationTitle: creation.title,
    gridSnapshot: creation.grid, configSnapshot: creation.config,
    previewUrl: creation.previewBlobKey ?? creation.previewDataUrl,
    lines: pricing.lines,
    subtotalCents: pricing.subtotalCents,
    shippingCents: pricing.shippingCents,
    taxCents: pricing.taxCents,
    royaltyCents: pricing.royaltyCents,
    royaltyPlayerId: buyerIsCreator ? undefined : creation.playerId,
    totalCents: pricing.totalCents,
    currency: "usd",
    shippingName: s.name!.trim(),
    shippingLine1: s.line1!.trim(),
    shippingLine2: s.line2?.trim(),
    shippingCity: s.city!.trim(),
    shippingRegion: s.region!.trim(),
    shippingPostalCode: s.postalCode!.trim(),
    shippingCountry: country,
    status: "pending-payment",
    statusHistory: [{ at: now, status: "pending-payment" }],
    giftMessage: body.giftMessage?.slice(0, 500),
    memorial: !!creation.config.memorial,
    createdAt: now, updatedAt: now,
  };

  const key = process.env.STRIPE_SECRET_KEY;
  if (key) {
    const stripe = new Stripe(key);
    const pi = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: order.currency,
      metadata: { creationOrderId: id, creationId: creation.id, playerId: me.id },
    });
    order.stripePaymentIntentId = pi.id;
    await insertCreationOrder(order);
    return NextResponse.json({ order, clientSecret: pi.client_secret });
  }

  // Dev mode: mark as paid so the production queue shows it.
  order.status = "paid";
  order.statusHistory.push({ at: now, status: "paid", note: "dev-mode auto-paid (no Stripe key)" });
  await insertCreationOrder(order);
  return NextResponse.json({ order });
}
