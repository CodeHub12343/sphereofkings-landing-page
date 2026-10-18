// Stripe Node SDK — server only. Returns `null` when STRIPE_SECRET_KEY
// isn't set so every call-site can fall through to the honest "not
// wired yet" state without crashing the import graph.
//
// The SDK is required dynamically on first use so bundlers don't try
// to pull it into the Edge runtime (middleware). Only Node-runtime
// server actions and route handlers touch this file.

import type Stripe from "stripe";

const KEY = process.env.STRIPE_SECRET_KEY;

type Cached = { client: Stripe | null };
const globalForStripe = globalThis as unknown as {
  _stripeCached?: Cached;
};
const cached: Cached = globalForStripe._stripeCached ?? { client: null };
globalForStripe._stripeCached = cached;

export function hasStripe(): boolean {
  return typeof KEY === "string" && KEY.length > 0;
}

export async function getStripe(): Promise<Stripe | null> {
  if (!hasStripe()) return null;
  if (cached.client) return cached.client;
  // Dynamic import keeps the SDK out of Edge bundles.
  const { default: StripeCtor } = await import("stripe");
  cached.client = new StripeCtor(KEY as string, {
    // Pin an API version so Stripe doesn't shift behavior underneath
    // us on their next release.
    apiVersion: "2024-10-28.acacia" as Stripe.LatestApiVersion,
  });
  return cached.client;
}

export function publishableKey(): string | null {
  const k = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return k && k.length > 0 ? k : null;
}
