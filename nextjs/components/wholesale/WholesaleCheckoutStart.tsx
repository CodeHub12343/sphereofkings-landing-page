"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styled from "styled-components";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { useCart } from "@/lib/cart";
import { beginWholesaleCheckoutAction } from "@/app/wholesale-checkout/actions";

type ResolvedLine = {
  slug: string;
  qty: number;
  productName: string;
  product: { name: string; image: string } | null;
};

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

const Shell = styled.article`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: clamp(24px, 4vw, 36px);
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Eye = styled.div`
  font-family: "Cinzel", serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a227;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const Lede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #a89880;
  margin: 0;
`;

const Panel = styled.div<{ $tone?: "warn" | "ok" | "crim" | "neutral" }>`
  background: ${(p) =>
    p.$tone === "warn"
      ? "rgba(224,169,74,0.08)"
      : p.$tone === "crim"
      ? "rgba(185,28,28,0.08)"
      : p.$tone === "ok"
      ? "rgba(79,176,125,0.08)"
      : "#1a1612"};
  border: 1px solid
    ${(p) =>
      p.$tone === "warn"
        ? "#e0a94a"
        : p.$tone === "crim"
        ? "#c62b44"
        : p.$tone === "ok"
        ? "#4fb07d"
        : "#2e2618"};
  border-radius: 10px;
  padding: 14px 16px;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #f5f0e8;

  h3 {
    font-family: "Cinzel", serif;
    font-size: 1rem;
    margin: 0 0 4px;
    color: #f5f0e8;
  }
  p {
    margin: 0;
    color: #a89880;
    line-height: 1.55;
  }
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Line = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: #1a1612;
  border-radius: 8px;
`;

const Thumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: #0a0a0a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const LineBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .name {
    font-family: "Inter", sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: #f5f0e8;
  }
  .meta {
    font-size: 0.75rem;
    color: #a89880;
  }
  .meta.warn {
    color: #e0a94a;
  }
`;

const Qty = styled.span`
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-weight: 700;
  color: #f0c040;
  font-size: 1rem;
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  margin: 0;
  padding: 12px 14px;
  background: #1a1612;
  border-radius: 10px;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.78rem;
    color: #a89880;
  }
  dd {
    margin: 0;
    text-align: right;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    color: #f5f0e8;
    font-size: 0.9rem;
  }
`;

const Actions = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid #1e1a12;
`;

const BtnPrimary = styled.button`
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border: 0;
  padding: 14px 26px;
  border-radius: 10px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &:hover:not(:disabled) {
    box-shadow: 0 0 28px rgba(240, 192, 64, 0.35);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const BtnGhost = styled(Link)`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  align-self: center;

  &:hover {
    color: #f0c040;
  }
`;

export default function WholesaleCheckoutStart({
  quoteRef,
  token,
  business,
  lines,
  cartSeed,
  requestedTier,
  autoTierPct,
  reservationExpiresISO,
  expired,
  revoked,
}: {
  quoteRef: string;
  token: string;
  business: string;
  lines: ResolvedLine[];
  cartSeed: { slug: string; qty: number }[];
  requestedTier: "auto" | "40";
  autoTierPct: number;
  reservationExpiresISO?: string;
  expired: boolean;
  revoked: boolean;
}) {
  const router = useRouter();
  const { replaceCart } = useCart();
  const [, startTransition] = useTransition();
  const [startError, setStartError] = useState<string | null>(null);

  const unavailable = lines.filter((l) => l.product === null);
  const available = lines.filter((l) => l.product !== null);
  const totalUnits = available.reduce((n, l) => n + l.qty, 0);
  const canStart =
    !expired && !revoked && available.length > 0;

  const tierLabel =
    requestedTier === "40"
      ? "40% (owner approved)"
      : `${autoTierPct}% automatic`;

  const start = () => {
    if (!canStart) return;
    startTransition(async () => {
      // Server-side revalidation of the token right before we commit.
      // Catches a shopper who left this tab open past the window.
      const res = await beginWholesaleCheckoutAction(token).catch(
        () => ({ ok: false, reason: "not-found" } as const),
      );
      if (!res.ok) {
        setStartError(
          res.reason === "expired"
            ? "The reservation window closed while you were on this page. Reply to the decision email and we will re-open the quote."
            : res.reason === "consumed"
            ? "This link has already been used for an order. Contact us for a new link."
            : res.reason === "revoked"
            ? "The admin changed this quote's status. A new link will come by email."
            : "This link isn't valid anymore. Contact us for a new one.",
        );
        return;
      }
      replaceCart(cartSeed);
      router.push("/checkout");
    });
  };

  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <Shell>
              <div>
                <Eye>Wholesale checkout · {quoteRef}</Eye>
                <Title style={{ marginTop: 8 }}>
                  {expired || revoked
                    ? "This link isn't active."
                    : `${business}, your reserved order is ready.`}
                </Title>
              </div>

              {revoked ? (
                <Panel $tone="crim" role="alert">
                  <h3>Link revoked</h3>
                  <p>
                    The admin changed the quote's status away from Approved.
                    Any new terms will arrive by email with a fresh link —
                    the old URL stops working as soon as the status changes.
                  </p>
                </Panel>
              ) : expired ? (
                <Panel $tone="crim" role="alert">
                  <h3>Reservation expired</h3>
                  <p>
                    The reservation window closed{" "}
                    {reservationExpiresISO
                      ? `on ${new Date(reservationExpiresISO).toLocaleString(
                          undefined,
                          { dateStyle: "long", timeStyle: "short" },
                        )}`
                      : ""}
                    . Reply to the decision email and we will re-open the
                    quote.
                  </p>
                </Panel>
              ) : (
                <Lede>
                  We reserved these units for you. Clicking{" "}
                  <strong style={{ color: "#f5f0e8" }}>
                    Start wholesale checkout
                  </strong>{" "}
                  seeds your cart with the agreed quantities and sends you
                  straight to checkout.
                </Lede>
              )}

              {unavailable.length > 0 && (
                <Panel $tone="warn">
                  <h3>Not every line is live yet</h3>
                  <p>
                    {unavailable.length} line
                    {unavailable.length === 1 ? "" : "s"} on this quote
                    reference{unavailable.length === 1 ? "s" : ""} a product
                    that is no longer in the public catalog. The remaining{" "}
                    {available.length} line{available.length === 1 ? "" : "s"}{" "}
                    are good to go.
                  </p>
                </Panel>
              )}

              <Lines>
                {lines.map((l, i) => (
                  <Line key={i}>
                    <Thumb>
                      {l.product && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={l.product.image} alt="" />
                      )}
                    </Thumb>
                    <LineBody>
                      <span className="name">
                        {l.product?.name ?? l.productName}
                      </span>
                      <span
                        className={`meta ${l.product ? "" : "warn"}`}
                      >
                        {l.product
                          ? "Reserved · Early Bird"
                          : "Not in catalog · will be excluded"}
                      </span>
                    </LineBody>
                    <Qty>× {l.qty}</Qty>
                  </Line>
                ))}
              </Lines>

              <Rows>
                <dt>Reference</dt>
                <dd>{quoteRef}</dd>
                <dt>Business</dt>
                <dd style={{ fontFamily: "'Inter', sans-serif" }}>
                  {business}
                </dd>
                <dt>Agreed tier</dt>
                <dd style={{ color: "#f0c040" }}>{tierLabel}</dd>
                <dt>Reserved units</dt>
                <dd>{totalUnits.toLocaleString()}</dd>
                {reservationExpiresISO && (
                  <>
                    <dt>Reservation expires</dt>
                    <dd style={{ fontFamily: "'Inter', sans-serif" }}>
                      {new Date(reservationExpiresISO).toLocaleString(
                        undefined,
                        { dateStyle: "long", timeStyle: "short" },
                      )}
                    </dd>
                  </>
                )}
              </Rows>

              {startError && (
                <Panel $tone="crim" role="alert">
                  <h3>Could not start checkout</h3>
                  <p>{startError}</p>
                </Panel>
              )}

              <Actions>
                <BtnGhost href="/wholesale">← Back to wholesale</BtnGhost>
                <BtnPrimary
                  type="button"
                  disabled={!canStart}
                  onClick={start}
                >
                  Start wholesale checkout
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7h8m-3-3 3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </BtnPrimary>
              </Actions>
            </Shell>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
