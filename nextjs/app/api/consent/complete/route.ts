import { NextResponse } from "next/server";
import Stripe from "stripe";
import { consentByToken, grantConsent } from "@/lib/db/collections/safety-io";
import { findPlayerById, updatePlayer } from "@/lib/db/collections/players";
import { pushNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const CONSENT_CHARGE_CENTS = 50;

/**
 * The consent page POSTs a Stripe PaymentMethod id here. We create a
 * $0.50 PaymentIntent, confirm immediately, refund right after, and
 * record the charge+refund ids as the paper trail (ADR-0006).
 */
export async function POST(req: Request) {
  let body: { token?: string; paymentMethodId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!body.token || !body.paymentMethodId) {
    return NextResponse.json({ error: "token and paymentMethodId required" }, { status: 400 });
  }

  const consent = await consentByToken(body.token);
  if (!consent) return NextResponse.json({ error: "unknown token" }, { status: 404 });
  if (consent.status !== "pending") return NextResponse.json({ error: "already resolved" }, { status: 409 });
  if (new Date(consent.tokenExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "token expired" }, { status: 410 });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "stripe not configured" }, { status: 503 });

  const stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion });
  const descriptor = "SPHEREOFKINGS CONSENT";

  try {
    const intent = await stripe.paymentIntents.create({
      amount: CONSENT_CHARGE_CENTS,
      currency: "usd",
      payment_method: body.paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      description: "Sphere of Kings parental consent (refunded immediately)",
      statement_descriptor_suffix: descriptor,
      metadata: { consentToken: body.token, playerId: consent.playerId },
    });
    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: `charge not succeeded: ${intent.status}` }, { status: 402 });
    }
    const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id;
    const refund = await stripe.refunds.create({
      payment_intent: intent.id,
      metadata: { consentToken: body.token },
    });

    await grantConsent(body.token, {
      chargeId,
      refundId: refund.id,
      mechanism: "micro-charge",
    });
    await updatePlayer(consent.playerId, { consentStatus: "parental-granted" });
    await pushNotification({
      recipientId: consent.playerId,
      kind: "consent-granted",
      payload: {},
    });

    const player = await findPlayerById(consent.playerId);
    return NextResponse.json({ ok: true, displayName: player?.displayName });
  } catch (err) {
    console.error("consent charge failed:", err);
    return NextResponse.json({ error: "charge failed" }, { status: 402 });
  }
}
