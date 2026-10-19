import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import { currentPlayer } from "@/lib/auth/player-session";
import { getDesign } from "@/lib/db/collections/sphere-designs";
import {
  CustomSphereOrder, ensureCustomSphereOrderIndexes,
  insertCustomSphereOrder, listCustomSphereOrders,
} from "@/lib/db/collections/custom-sphere-orders";

export const runtime = "nodejs";

const CUSTOM_SPHERE_PRICE_CENTS = 14900; // $149.00 — placeholder, James sets final.

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  // Players see their own orders; admins hit /admin/fulfillment for all.
  const all = await listCustomSphereOrders();
  const mine = all.filter((o) => o.playerId === me.id);
  return NextResponse.json({ orders: mine });
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: {
    designId?: string;
    shipping?: {
      name?: string; line1?: string; line2?: string;
      city?: string; region?: string; postalCode?: string; country?: string;
    };
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (!body.designId) return NextResponse.json({ error: "designId required" }, { status: 400 });
  const s = body.shipping ?? {};
  for (const field of ["name", "line1", "city", "region", "postalCode", "country"] as const) {
    if (!s[field] || String(s[field]).trim().length < 1) {
      return NextResponse.json({ error: `shipping.${field} required` }, { status: 400 });
    }
  }
  const country = s.country!.trim().toUpperCase();
  if (country.length !== 2) {
    return NextResponse.json({ error: "country must be ISO alpha-2" }, { status: 400 });
  }

  const design = await getDesign(body.designId);
  if (!design) return NextResponse.json({ error: "design not found" }, { status: 404 });
  if (design.playerId !== me.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await ensureCustomSphereOrderIndexes();

  const id = randomUUID();
  const now = new Date().toISOString();
  const order: CustomSphereOrder = {
    id, playerId: me.id,
    playerUsername: me.username, playerDisplayName: me.displayName,
    designId: design.id, designTitle: design.title,
    designGridSnapshot: design.grid,
    designPreviewUrl: design.previewBlobKey ?? design.previewDataUrl,
    shippingName: s.name!.trim(),
    shippingLine1: s.line1!.trim(),
    shippingLine2: s.line2?.trim(),
    shippingCity: s.city!.trim(),
    shippingRegion: s.region!.trim(),
    shippingPostalCode: s.postalCode!.trim(),
    shippingCountry: country,
    priceCents: CUSTOM_SPHERE_PRICE_CENTS,
    currency: "usd",
    status: "pending-payment",
    createdAt: now, updatedAt: now,
  };

  // Create a Stripe PaymentIntent so the client can confirm.
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Dev-mode: skip Stripe, mark as paid directly so admins can see
    // the end-to-end flow without live keys.
    order.status = "paid";
    await insertCustomSphereOrder(order);
    return NextResponse.json({ order, clientSecret: null });
  }
  const stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion });
  const intent = await stripe.paymentIntents.create({
    amount: order.priceCents, currency: order.currency,
    automatic_payment_methods: { enabled: true },
    description: `Custom sphere: ${design.title}`,
    metadata: {
      orderId: id, playerId: me.id, designId: design.id, kind: "custom-sphere",
    },
    shipping: {
      name: order.shippingName,
      address: {
        line1: order.shippingLine1,
        line2: order.shippingLine2 ?? undefined,
        city: order.shippingCity,
        state: order.shippingRegion,
        postal_code: order.shippingPostalCode,
        country: order.shippingCountry,
      },
    },
  });
  order.stripePaymentIntentId = intent.id;
  await insertCustomSphereOrder(order);
  return NextResponse.json({ order, clientSecret: intent.client_secret });
}
