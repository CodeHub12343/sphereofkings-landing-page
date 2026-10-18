"use client";

import styled from "styled-components";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap } from "@/components/shared";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/products";

const Section = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px);
  min-height: 60vh;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  margin: 0 0 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 72px 20px;
  color: #a89880;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

const EmptyIcon = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid #2e2618;
  display: grid;
  place-items: center;
  color: #c9a227;
`;

const BrowseLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  text-decoration: none;
`;

const Line = styled.article`
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 16px;
  padding: 16px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;

  @media (max-width: 480px) {
    grid-template-columns: 72px 1fr;
    grid-template-rows: auto auto;
  }
`;

const Thumb = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
  }
`;

const LineBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LineName = styled.div`
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
`;

const LinePending = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #e0a94a;
`;

const QtyBox = styled.div`
  display: inline-flex;
  align-items: center;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
`;

const QtyBtn = styled.button`
  width: 32px;
  height: 32px;
  background: transparent;
  border: 0;
  color: #f5f0e8;
  font-size: 1rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: #f0c040;
    background: rgba(201, 162, 39, 0.08);
  }
  &:disabled {
    color: #3a3025;
    cursor: not-allowed;
  }
`;

const QtyVal = styled.span`
  display: inline-block;
  min-width: 28px;
  text-align: center;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  color: #f5f0e8;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
`;

const LineRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;

  @media (max-width: 480px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const LinePrice = styled.span<{ $muted?: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
`;

const Remove = styled.button`
  background: transparent;
  border: 0;
  color: #5a4a38;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: #b91c1c;
  }
`;

const Summary = styled.aside`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 90px;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.05rem;
    margin: 0;
    font-weight: 700;
  }
`;

const Totals = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  margin: 0;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.85rem;
    color: #a89880;
  }
  dd {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 700;
    color: #f5f0e8;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  dd.muted {
    color: #5a4a38;
    font-weight: 500;
    font-style: italic;
    font-size: 0.85rem;
  }
`;

const PendingBanner = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px solid #e0a94a;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #e0a94a;
`;

const CheckoutBtn = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 14px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
`;

const KeepShopping = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a89880;
  text-decoration: none;
  text-align: center;

  &:hover {
    color: #f0c040;
  }
`;

export default function CartPageView() {
  const { lines, setQty, removeItem, hasUnapprovedPrice } = useCart();
  const empty = lines.length === 0;

  // Sum only the lines with approved prices; `hasUnapprovedPrice`
  // controls whether we show a total or the "price pending" state.
  const subtotal = lines.reduce((n, l) => {
    if (!l.product.priceApproved || !l.product.price) return n;
    return n + l.product.price.amount * l.qty;
  }, 0);
  const currency = lines.find((l) => l.product.price)?.product.price?.currency ?? "USD";

  return (
    <>
      <Header />
      <Section>
        <Wrap>
          <Title>Your cart</Title>
          {empty ? (
            <Empty>
              <EmptyIcon aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 30 30" fill="none">
                  <path
                    d="M4 6h4l2 14h14l2-10H10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="24" r="1.6" fill="currentColor" />
                  <circle cx="22" cy="24" r="1.6" fill="currentColor" />
                </svg>
              </EmptyIcon>
              <p>Your cart is empty.</p>
              <BrowseLink href="/shop">Browse the shop</BrowseLink>
            </Empty>
          ) : (
            <Grid>
              <Lines>
                {lines.map((l) => (
                  <Line key={l.slug}>
                    <Thumb>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.product.image} alt="" />
                    </Thumb>
                    <LineBody>
                      <LineName>{l.product.name}</LineName>
                      {!l.product.priceApproved && (
                        <LinePending>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="5"
                              cy="5"
                              r="4"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M5 3v3"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                            />
                          </svg>
                          Price pending
                        </LinePending>
                      )}
                      <QtyBox>
                        <QtyBtn
                          type="button"
                          onClick={() => setQty(l.slug, l.qty - 1)}
                          disabled={l.qty <= 1}
                          aria-label={`Decrease ${l.product.name}`}
                        >
                          −
                        </QtyBtn>
                        <QtyVal aria-live="polite">{l.qty}</QtyVal>
                        <QtyBtn
                          type="button"
                          onClick={() => setQty(l.slug, l.qty + 1)}
                          disabled={l.qty >= 10}
                          aria-label={`Increase ${l.product.name}`}
                        >
                          +
                        </QtyBtn>
                      </QtyBox>
                    </LineBody>
                    <LineRight>
                      <LinePrice $muted={!l.product.priceApproved}>
                        {l.product.priceApproved && l.product.price
                          ? formatMoney(
                              l.product.price.amount * l.qty,
                              l.product.price.currency,
                            )
                          : "$—"}
                      </LinePrice>
                      <Remove
                        type="button"
                        onClick={() => removeItem(l.slug)}
                        aria-label={`Remove ${l.product.name}`}
                      >
                        Remove
                      </Remove>
                    </LineRight>
                  </Line>
                ))}
              </Lines>
              <Summary>
                <h2>Order summary</h2>
                <Totals>
                  <dt>Subtotal</dt>
                  <dd className={hasUnapprovedPrice ? "muted" : ""}>
                    {hasUnapprovedPrice
                      ? "price pending"
                      : formatMoney(subtotal, currency)}
                  </dd>
                  <dt>Shipping</dt>
                  <dd className="muted">calculated at checkout</dd>
                  <dt>Tax</dt>
                  <dd className="muted">calculated at checkout</dd>
                </Totals>
                {hasUnapprovedPrice && (
                  <PendingBanner>
                    The owner is finalising pricing. You can review your
                    selection at checkout — Pay unlocks once prices are
                    approved.
                  </PendingBanner>
                )}
                <CheckoutBtn href="/checkout">
                  Continue to checkout
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
                </CheckoutBtn>
                <KeepShopping href="/shop">Keep shopping</KeepShopping>
              </Summary>
            </Grid>
          )}
        </Wrap>
      </Section>
      <Footer />
    </>
  );
}
