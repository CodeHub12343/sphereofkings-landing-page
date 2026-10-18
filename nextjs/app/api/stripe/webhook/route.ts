import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import {
  findOrderByPaymentIntent,
  findOrderByRef,
  updateOrderPayment,
} from "@/lib/db/collections/orders";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import {
  computeCommissionMinor,
  listAttributionsByOrderRef,
  updateAttributionStatus,
  updateOneAttribution,
} from "@/lib/db/collections/attributed-orders";
import { recomputeAffiliateTier } from "@/lib/affiliate-promotion";
import { sendEmail } from "@/lib/email/send";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";
import { createElement } from "react";

// Stripe webhook endpoint. Verifies the signature with
// STRIPE_WEBHOOK_SECRET, then handles the two events we care about:
//
//   payment_intent.succeeded   → flip the order to "paid"
//   payment_intent.payment_failed → flip the order to "failed"
//
// Must run on Node (not Edge) because the Stripe SDK's signature
// verifier uses Node crypto under the hood.
export const runtime = "nodejs";

function originFromEnv(): string {
  // Public site URL for links inside transactional emails. Env override
  // keeps dev/stage/prod separate; falls back to the production domain.
  const u = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return u || "https://sphereofkings.com";
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 503 },
    );
  }
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  // Must use the raw body (string) for signature verification. Next's
  // app-router Request supports .text() which gives us exactly that.
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Signature verification failed",
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 400 },
    );
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const ref =
        (pi.metadata && (pi.metadata.orderRef as string | undefined)) ||
        undefined;
      const order = ref
        ? await findOrderByRef(ref)
        : await findOrderByPaymentIntent(pi.id);
      if (order) {
        await updateOrderPayment(order.ref, "paid", {
          stripePaymentIntentId: pi.id,
        });
        await recordAuditEvent({
          actor: { kind: "system" },
          action: "order.paid",
          target: { collection: "orders", id: order.ref },
          summary: `Payment confirmed · $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`,
          details: {
            paymentIntentId: pi.id,
            amountMinor: pi.amount,
            currency: pi.currency,
            affiliateCode: pi.metadata?.affiliateCode ?? null,
          },
        });

        // Flip every attribution for this order to eligible and
        // compute each row's commission from its own tier% + sharePct.
        // A split order has two rows (first-touch 50% + last-touch 50%),
        // a sole-touch order has one.
        const attributions = await listAttributionsByOrderRef(order.ref);
        for (const attr of attributions) {
          const commissionMinor = computeCommissionMinor(
            pi.amount,
            attr.commissionTierPct,
            attr.sharePct ?? 100,
          );
          await updateOneAttribution(attr.orderRef, attr.affiliateCode, {
            status: "eligible",
            commissionAmountMinor: commissionMinor,
            orderTotalMinor: pi.amount,
          });
          // Re-evaluate THIS affiliate's tier against their new
          // eligible count. Historical commissions on prior orders
          // don't shift because tier% is snapshotted per attribution.
          await recomputeAffiliateTier(attr.affiliateCode).catch(() => {});
        }

        // Transactional email: order confirmation to the buyer.
        // Non-blocking — a send failure never undoes the payment, we
        // just audit it so the operator can resend manually.
        if (order.customerEmail) {
          const first = (order.customerName || "").split(/\s+/)[0] || undefined;
          const totalDisplay = `$${(pi.amount / 100).toFixed(2)}`;
          const emailResult = await sendEmail({
            to: order.customerEmail,
            subject: `Order confirmed · ${order.ref} · Sphere of Kings`,
            react: createElement(OrderConfirmationEmail, {
              firstName: first,
              orderRef: order.ref,
              lines: (order.lines ?? []).map((l) => ({
                name: l.name,
                qty: l.qty,
                totalDisplay: "$—",
              })),
              subtotalDisplay: totalDisplay,
              shippingDisplay: "$—",
              taxDisplay: "$—",
              totalDisplay,
              shipTo: order.shipTo
                ? [
                    order.shipTo.name,
                    order.shipTo.line1,
                    order.shipTo.line2 ?? "",
                    `${order.shipTo.city} ${order.shipTo.postal}`.trim(),
                    order.shipTo.country,
                  ]
                    .filter(Boolean)
                    .join("\n")
                : order.customerName,
              orderUrl: `${originFromEnv()}/order/${order.ref}`,
              affiliateCode: order.affiliateCode,
            }),
          }).catch((e) => ({ ok: false, reason: (e as Error).message } as const));
          await recordAuditEvent({
            actor: { kind: "system" },
            action: emailResult.ok
              ? "order.email.confirmation.sent"
              : "order.email.confirmation.failed",
            target: { collection: "orders", id: order.ref },
            summary: emailResult.ok
              ? `Order confirmation sent to ${order.customerEmail}`
              : `Order confirmation NOT sent: ${emailResult.reason}`,
            details: {
              to: order.customerEmail,
              resendId: emailResult.ok ? emailResult.id : null,
              reason: emailResult.ok ? null : emailResult.reason,
            },
          }).catch(() => {});
        }
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      const ref =
        (pi.metadata && (pi.metadata.orderRef as string | undefined)) ||
        undefined;
      const order = ref
        ? await findOrderByRef(ref)
        : await findOrderByPaymentIntent(pi.id);
      if (order) {
        await updateOrderPayment(order.ref, "failed", {
          stripePaymentIntentId: pi.id,
        });
        await recordAuditEvent({
          actor: { kind: "system" },
          action: "order.payment_failed",
          target: { collection: "orders", id: order.ref },
          summary: `Payment failed · ${pi.last_payment_error?.message ?? "unknown reason"}`,
          details: {
            paymentIntentId: pi.id,
            reason: pi.last_payment_error?.code ?? null,
          },
        });
        await updateAttributionStatus(order.ref, "cancelled");
      }
    } else if (event.type === "charge.refunded") {
      // A full or partial refund fired. For a FULL refund we flip the
      // order to "refunded" and auto-adjust any attribution: status
      // flips to "cancelled" and commissionAmountMinor is zeroed so
      // the affiliate's eligible-commission total drops immediately.
      // A partial refund keeps "refund-pending" + the current
      // commission untouched, since we don't model proportional
      // adjustments yet.
      const charge = event.data.object;
      const intentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (intentId) {
        const order = await findOrderByPaymentIntent(intentId);
        if (order) {
          const isFull = charge.amount_refunded >= charge.amount;
          await updateOrderPayment(
            order.ref,
            isFull ? "refunded" : "refund-pending",
          );
          await recordAuditEvent({
            actor: { kind: "system" },
            action: isFull ? "order.refunded" : "order.refund_pending",
            target: { collection: "orders", id: order.ref },
            summary: `${isFull ? "Full refund" : "Partial refund"} from Stripe · ${(
              charge.amount_refunded / 100
            ).toFixed(2)} ${charge.currency.toUpperCase()}`,
            details: {
              chargeId: charge.id,
              amountRefundedMinor: charge.amount_refunded,
              amountOriginalMinor: charge.amount,
              currency: charge.currency,
              fullRefund: isFull,
            },
          });

          if (isFull) {
            // Cancel every attribution for this order and zero its
            // commission so admin dashboards reflect the clawback
            // immediately. Also drop the affiliate's eligible count
            // back by recomputing their tier (demotion possible).
            const attributions = await listAttributionsByOrderRef(order.ref);
            for (const attr of attributions) {
              await updateOneAttribution(attr.orderRef, attr.affiliateCode, {
                status: "cancelled",
                commissionAmountMinor: 0,
              });
              await recomputeAffiliateTier(attr.affiliateCode).catch(() => {});
            }
          } else {
            // Partial refund — scale each attribution's commission by
            // the retained portion of the charge. Status flips to
            // refund-pending so the admin can see the row needs review,
            // but the dollar value already reflects the clawback so no
            // one pays out the pre-refund amount by accident.
            const retainedRatio =
              (charge.amount - charge.amount_refunded) / charge.amount;
            const attributions = await listAttributionsByOrderRef(order.ref);
            for (const attr of attributions) {
              const scaled = Math.round(
                (attr.commissionAmountMinor ?? 0) * retainedRatio,
              );
              await updateOneAttribution(attr.orderRef, attr.affiliateCode, {
                status: "refund-pending",
                commissionAmountMinor: scaled,
              });
              await recordAuditEvent({
                actor: { kind: "system" },
                action: "attribution.partialRefundAdjusted",
                target: { collection: "orders", id: order.ref },
                summary: `Scaled ${attr.affiliateCode}'s commission on ${order.ref} by ${(retainedRatio * 100).toFixed(1)}% after partial refund`,
                details: {
                  before: attr.commissionAmountMinor ?? 0,
                  after: scaled,
                  retainedRatio,
                  refundedMinor: charge.amount_refunded,
                  originalMinor: charge.amount,
                },
              }).catch(() => {});
            }
          }
        }
      }
    }
    // Any other event type: acknowledge so Stripe stops retrying but
    // don't act on it. Extend here as the real catalog of events grows.
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[stripe-webhook] handler failed", event.type, err);
    return NextResponse.json(
      { error: "handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
