"use server";

import { revalidatePath } from "next/cache";
import {
  CreateOrderInput,
  createPendingOrder,
  findOrderByRef,
  StoredOrderLine,
  updateOrderPayment,
} from "@/lib/db/collections/orders";
import { findProductBySlug } from "@/lib/db/collections/products";
import { pricing } from "@/lib/products";
import { getStripe, hasStripe, publishableKey } from "@/lib/stripe/server";
import { OrderOrigin, ShipTo } from "@/lib/sample-orders";
import { createAttribution } from "@/lib/db/collections/attributed-orders";
import { findAffiliateByCode } from "@/lib/db/collections/affiliates";
import { cookies } from "next/headers";
import {
  AFF_ATTR_COOKIE,
  AFF_FIRST_COOKIE,
  AFF_TOUCHES_COOKIE,
  ATTRIBUTION_MODEL,
  isWithinAttributionWindow,
  parseAttrCookie,
  parseTouchesCookie,
  Touch,
} from "@/lib/affiliate-auth";
import { AFF_SESSION_COOKIE, readSessionToken } from "@/lib/auth/token";
import { recordAuditEvent } from "@/lib/db/collections/audit";
import { StoredAffiliate } from "@/lib/db/collections/affiliates";
import { getQuoteByToken, markQuoteConsumed } from "@/lib/store/quotes-store";
import { isExpired } from "@/lib/wholesale-checkout";
import { WHOLESALE_TOKEN_COOKIE } from "@/lib/wholesale-cookie";
import { adjustReservedUnits } from "@/lib/db/collections/products";

export type OrderDraftLine = {
  slug: string;
  name: string;
  qty: number;
};

export type OrderDraftInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shipTo: ShipTo;
  lines: OrderDraftLine[];
  affiliateCode?: string;
  // When product prices stay unapproved the totalDisplay is "$—". We
  // keep whatever string the UI computed rather than inventing a value.
  totalDisplay: string;
};

export type CreateOrderResult =
  | { ok: true; ref: string }
  | { ok: false; error: string };

export async function createPendingOrderAction(
  input: OrderDraftInput,
): Promise<CreateOrderResult> {
  if (!/.+@.+\..+/.test(input.customerEmail)) {
    return { ok: false, error: "Enter a valid email before continuing." };
  }
  if (!input.customerName.trim()) {
    return { ok: false, error: "Enter a name before continuing." };
  }
  if (!input.lines.length) {
    return { ok: false, error: "Your cart is empty." };
  }

  const lines: StoredOrderLine[] = input.lines.map((l) => ({
    slug: l.slug,
    name: l.name,
    qty: l.qty,
  }));
  const totalUnits = lines.reduce((n, l) => n + l.qty, 0);
  const itemSummary =
    lines.length === 1
      ? `${lines[0].qty} × ${lines[0].name}`
      : `${lines.length} products · ${totalUnits} units`;

  // Wholesale handoff: when the buyer came through /wholesale-checkout
  // the beginWholesaleCheckoutAction dropped a short-lived cookie with
  // the approval token. We revalidate the quote here (window + state +
  // not-already-consumed) and, when good, flip origin to "wholesale",
  // attach the quote ref + discount, and remember to mark the token
  // consumed after the order writes.
  const jarForQuote = await cookies();
  const wsToken = jarForQuote.get(WHOLESALE_TOKEN_COOKIE)?.value;
  const quote = wsToken
    ? await getQuoteByToken(wsToken).catch(() => undefined)
    : undefined;
  const quoteOk =
    !!quote &&
    quote.state === "approved" &&
    !quote.tokenConsumedISO &&
    !isExpired(quote.reservationExpiresISO);
  const origin: OrderOrigin = quoteOk ? "wholesale" : "early-bird";
  const discountPct = quoteOk
    ? quote.requestedTier === "40"
      ? 40
      : Math.max(0, quote.autoTierPct || 0)
    : 0;

  const payload: CreateOrderInput = {
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    origin,
    affiliateCode: input.affiliateCode,
    lines,
    itemSummary,
    totalDisplay: input.totalDisplay,
    shipTo: input.shipTo,
    wholesaleQuoteRef: quoteOk ? quote.ref : undefined,
    discountPct: discountPct > 0 ? discountPct : undefined,
  };

  try {
    const order = await createPendingOrder(payload);

    // Mark the quote's token consumed and clear the handoff cookie so
    // the link can't be reused for another order (gap 5).
    if (quoteOk && quote) {
      await markQuoteConsumed(quote.ref, order.ref).catch(() => {});
      jarForQuote.delete(WHOLESALE_TOKEN_COOKIE);
      // Release the reservation on each line — the units will be
      // counted against unitsSold once the Stripe webhook flips the
      // order to paid, so holding BOTH would double-count.
      for (const l of quote.lines) {
        await adjustReservedUnits(l.productSlug, -l.qty).catch(() => {});
      }
      await recordAuditEvent({
        actor: { kind: "system" },
        action: "quote.token.consumed",
        target: { collection: "quotes", id: quote.ref },
        summary: `Wholesale quote ${quote.ref} consumed by order ${order.ref}`,
        details: {
          orderRef: order.ref,
          discountPct,
          business: quote.business,
        },
      }).catch(() => {});
    }

    // If the cart arrived with an affiliate code and the affiliate is
    // still active, write an attribution record. Pending until the
    // Stripe webhook flips the order to paid.
    // Attribution: respects the configured ATTRIBUTION_MODEL, the
    // first-/last-touch cookies, the window + self-referral guards.
    // The incoming input.affiliateCode is the last-touch value the
    // client surfaced; we re-derive the real touches from cookies.
    if (input.affiliateCode) {
      const jar = await cookies();
      const touches = parseTouchesCookie(
        jar.get(AFF_TOUCHES_COOKIE)?.value ?? "",
      );
      // Fallbacks for shoppers whose cookies predate the touches store:
      // reconstruct from the first/last single-code cookies.
      const first = parseAttrCookie(jar.get(AFF_FIRST_COOKIE)?.value ?? "");
      const last = parseAttrCookie(jar.get(AFF_ATTR_COOKIE)?.value ?? "");
      const effectiveTouches: Touch[] =
        touches.length > 0
          ? touches
          : [first, last]
              .filter((t): t is NonNullable<typeof t> => !!t)
              .map((t) => ({ code: t.code, clickISO: t.firstClickISO }));

      const affSessionCookie = jar.get(AFF_SESSION_COOKIE)?.value;
      const session = affSessionCookie
        ? await readSessionToken(affSessionCookie, "affiliate").catch(() => null)
        : null;

      // Resolve a single touch into an attribution-eligible affiliate.
      const resolveTouch = async (
        t: Touch,
        touchKind: "first" | "last" | "sole",
      ): Promise<
        | {
            aff: StoredAffiliate;
            touch: "first" | "last" | "sole";
          }
        | null
      > => {
        if (!isWithinAttributionWindow(t.clickISO)) return null;
        const aff = await findAffiliateByCode(t.code).catch(() => undefined);
        if (!aff || aff.state !== "active") return null;
        const sameEmail =
          aff.email.trim().toLowerCase() ===
          input.customerEmail.trim().toLowerCase();
        const selfSession = session?.id?.toUpperCase() === aff.code;
        if (sameEmail || selfSession) {
          await recordAuditEvent({
            actor: { kind: "system" },
            action: "attribution.selfReferralRejected",
            target: { collection: "orders", id: order.ref },
            summary: `Rejected ${touchKind}-touch self-referral attribution to ${aff.code}`,
            details: {
              reason: sameEmail ? "email-match" : "session-match",
              touch: touchKind,
              affiliateCode: aff.code,
            },
          }).catch(() => {});
          return null;
        }
        return { aff, touch: touchKind };
      };

      // De-dup touches by code (keep ORIGINAL position for first-touch
      // semantics; the appendTouch helper already does this on write).
      // Resolve each in order so we know which ones are eligible.
      const resolved: Array<{
        aff: StoredAffiliate;
        touch: "first" | "last" | "sole";
      }> = [];
      for (let i = 0; i < effectiveTouches.length; i++) {
        const t = effectiveTouches[i];
        const kind: "first" | "last" | "sole" =
          effectiveTouches.length === 1
            ? "sole"
            : i === 0
            ? "first"
            : i === effectiveTouches.length - 1
            ? "last"
            : "sole";
        const r = await resolveTouch(t, kind);
        if (r) resolved.push(r);
      }

      const unitCount = lines.reduce((n, l) => n + l.qty, 0);

      type Rec = {
        aff: StoredAffiliate;
        touch: "first" | "last" | "sole";
        sharePct: number;
      };
      const records: Rec[] = [];

      if (resolved.length > 0) {
        const firstR = resolved[0];
        const lastR = resolved[resolved.length - 1];
        const middles = resolved.slice(1, -1);

        if (ATTRIBUTION_MODEL === "first-touch") {
          records.push({ ...firstR, touch: "first", sharePct: 100 });
        } else if (ATTRIBUTION_MODEL === "last-touch") {
          records.push({ ...lastR, touch: "last", sharePct: 100 });
        } else if (ATTRIBUTION_MODEL === "split") {
          if (resolved.length === 1 || firstR.aff.code === lastR.aff.code) {
            records.push({ ...firstR, touch: "sole", sharePct: 100 });
          } else {
            records.push({ ...firstR, touch: "first", sharePct: 50 });
            records.push({ ...lastR, touch: "last", sharePct: 50 });
          }
        } else if (ATTRIBUTION_MODEL === "linear") {
          // Equal credit across every UNIQUE affiliate in the touches
          // list (resolved is already code-unique thanks to appendTouch).
          const share = Math.floor(10000 / resolved.length) / 100; // e.g. 33.33
          const touchKind = (i: number): "first" | "last" | "sole" =>
            resolved.length === 1
              ? "sole"
              : i === 0
              ? "first"
              : i === resolved.length - 1
              ? "last"
              : "sole";
          for (let i = 0; i < resolved.length; i++) {
            records.push({
              ...resolved[i],
              touch: touchKind(i),
              sharePct: share,
            });
          }
        } else if (ATTRIBUTION_MODEL === "u-shape") {
          if (resolved.length === 1) {
            records.push({ ...firstR, touch: "sole", sharePct: 100 });
          } else if (resolved.length === 2) {
            // No middle — split 50/50, same as `split`.
            records.push({ ...firstR, touch: "first", sharePct: 50 });
            records.push({ ...lastR, touch: "last", sharePct: 50 });
          } else {
            // U-shape: 40 + 40 + 20 evenly split across middles.
            records.push({ ...firstR, touch: "first", sharePct: 40 });
            const midShare =
              Math.floor((2000 / middles.length)) / 100; // e.g. 10 for 2 middles
            for (const m of middles) {
              records.push({ ...m, touch: "sole", sharePct: midShare });
            }
            records.push({ ...lastR, touch: "last", sharePct: 40 });
          }
        }
      }

      for (const r of records) {
        await createAttribution({
          orderRef: order.ref,
          affiliateCode: r.aff.code,
          commissionTierPct: r.aff.tierRatePct,
          sharePct: r.sharePct,
          touch: r.touch,
          unitCount,
        });
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/affiliates");
    revalidatePath("/affiliate");
    return { ok: true, ref: order.ref };
  } catch {
    return {
      ok: false,
      error: "Could not save your order. Please try again.",
    };
  }
}

/* ---------------------- Stripe payment intent ---------------------- */

export type PaymentIntentResult =
  | {
      ok: true;
      clientSecret: string;
      publishableKey: string;
      amountMinor: number;
    }
  // Honest refusals. Each kind gives the UI a reason to show without
  // guessing why the Pay step is blocked.
  | { ok: false; reason: "stripe-not-wired" }
  | { ok: false; reason: "price-pending"; slug: string }
  | { ok: false; reason: "order-not-found" }
  | { ok: false; reason: "server-error"; message: string };

export async function createPaymentIntentAction(
  orderRef: string,
): Promise<PaymentIntentResult> {
  if (!hasStripe()) return { ok: false, reason: "stripe-not-wired" };
  const key = publishableKey();
  if (!key) return { ok: false, reason: "stripe-not-wired" };

  const order = await findOrderByRef(orderRef);
  if (!order) return { ok: false, reason: "order-not-found" };

  // Compute amount from the live product catalog so the UI can't
  // over- or under-charge via a tampered client-side total. Use the
  // sale price (retail minus the site-wide discount) — this is what
  // the shop advertises and what the customer agreed to pay.
  let subtotalMinor = 0;
  for (const line of order.lines ?? []) {
    const product = await findProductBySlug(line.slug);
    if (!product || !product.priceApproved || !product.price) {
      return { ok: false, reason: "price-pending", slug: line.slug };
    }
    const p = pricing(product);
    if (!p) return { ok: false, reason: "price-pending", slug: line.slug };
    subtotalMinor += Math.round(p.sale * 100) * line.qty;
  }
  // Apply the wholesale discount if the order carries one. Floor at
  // the Stripe minimum further down.
  const discountPct = Math.max(0, Math.min(99, order.discountPct ?? 0));
  const discountMinor = Math.round((subtotalMinor * discountPct) / 100);
  const totalMinor = subtotalMinor - discountMinor;
  if (totalMinor < 50) {
    // Stripe minimum: $0.50. Guard early with a clear reason.
    return {
      ok: false,
      reason: "server-error",
      message: "Order total is below the $0.50 Stripe minimum.",
    };
  }

  try {
    const stripe = await getStripe();
    if (!stripe) return { ok: false, reason: "stripe-not-wired" };

    // Re-use an existing intent on the same order if one is live, so a
    // Review → Pay → Back → Pay round-trip doesn't double-create.
    let intent;
    if (order.stripePaymentIntentId) {
      try {
        intent = await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId,
        );
        if (intent.status === "succeeded" || intent.status === "canceled") {
          intent = undefined;
        }
      } catch {
        intent = undefined;
      }
    }
    if (!intent) {
      intent = await stripe.paymentIntents.create({
        amount: totalMinor,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderRef: order.ref,
          origin: order.origin,
          ...(order.affiliateCode ? { affiliateCode: order.affiliateCode } : {}),
          ...(order.wholesaleQuoteRef
            ? { wholesaleQuoteRef: order.wholesaleQuoteRef }
            : {}),
          ...(discountPct > 0 ? { discountPct: String(discountPct) } : {}),
        },
        description:
          discountPct > 0
            ? `Sphere of Kings · ${order.ref} · wholesale ${discountPct}% off`
            : `Sphere of Kings · ${order.ref}`,
        receipt_email: order.customerEmail || undefined,
      });
    } else if (intent.amount !== totalMinor) {
      // Amount changed (price approved, qty adjusted). Update the
      // intent so Stripe charges the right number.
      intent = await stripe.paymentIntents.update(intent.id, {
        amount: totalMinor,
      });
    }

    await updateOrderPayment(order.ref, "pending", {
      stripePaymentIntentId: intent.id,
      totalMinor,
    });

    return {
      ok: true,
      clientSecret: intent.client_secret ?? "",
      publishableKey: key,
      amountMinor: totalMinor,
    };
  } catch (err) {
    return {
      ok: false,
      reason: "server-error",
      message: err instanceof Error ? err.message : "Unknown Stripe error.",
    };
  }
}
