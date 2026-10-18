import { notFound } from "next/navigation";
import { getQuoteByToken } from "@/lib/store/quotes-store";
import { isExpired } from "@/lib/wholesale-checkout";
import { PRODUCTS } from "@/lib/products";
import WholesaleCheckoutStart from "@/components/wholesale/WholesaleCheckoutStart";

export const metadata = {
  title: "Wholesale checkout — Sphere of Kings",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function WholesaleCheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote) notFound();

  const expired = isExpired(quote.reservationExpiresISO);
  // Token is "revoked" when the admin moved the quote away from
  // approved, OR when the link has already been used for an order
  // (single-use enforcement).
  const revoked =
    quote.state !== "approved" ||
    !quote.checkoutToken ||
    !!quote.tokenConsumedISO;

  // Map quote lines to catalog products so we can seed the cart. Lines
  // that reference a slug not present in the catalog are surfaced as
  // "unavailable" rather than silently dropped — the buyer sees exactly
  // what's missing before they start.
  const resolvedLines = quote.lines.map((l) => {
    const product = PRODUCTS.find((p) => p.slug === l.productSlug);
    return {
      slug: l.productSlug,
      qty: l.qty,
      productName: l.productName,
      product: product
        ? {
            name: product.name,
            image: product.image,
          }
        : null,
    };
  });
  const cartSeed = resolvedLines
    .filter((l) => l.product !== null)
    .map((l) => ({ slug: l.slug, qty: l.qty }));

  return (
    <WholesaleCheckoutStart
      quoteRef={quote.ref}
      token={quote.checkoutToken ?? ""}
      business={quote.business}
      lines={resolvedLines}
      cartSeed={cartSeed}
      requestedTier={quote.requestedTier}
      autoTierPct={quote.autoTierPct}
      reservationExpiresISO={quote.reservationExpiresISO}
      expired={expired}
      revoked={revoked}
    />
  );
}
