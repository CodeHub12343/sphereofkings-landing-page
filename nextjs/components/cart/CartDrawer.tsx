"use client";

import { useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useCart } from "@/lib/cart";

const Scrim = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 201;
  width: min(420px, 100vw);
  background: #0a0a0a;
  border-left: 1px solid #1a1510;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
  transform: translateX(${(p) => (p.$open ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Head = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 22px;
  border-bottom: 1px solid #1a1510;

  h2 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 1.15rem;
    margin: 0;
    font-weight: 700;
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: 1px solid #2e2618;
  color: #a89880;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: #a89880;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
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
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  text-decoration: none;
`;

const Line = styled.article`
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  padding: 12px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 10px;
`;

const Thumb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 8px;
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LineName = styled.div`
  font-family: "Cinzel", serif;
  color: #f5f0e8;
  font-size: 0.9rem;
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
  width: 28px;
  height: 28px;
  background: transparent;
  border: 0;
  color: #f5f0e8;
  font-size: 0.95rem;
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
  min-width: 24px;
  text-align: center;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  color: #f5f0e8;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
`;

const LineRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
`;

const LinePrice = styled.span<{ $muted?: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
`;

const Remove = styled.button`
  background: transparent;
  border: 0;
  color: #5a4a38;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: #b91c1c;
  }
`;

const Foot = styled.footer`
  padding: 18px 22px 22px;
  border-top: 1px solid #1a1510;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Totals = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  margin: 0;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.8rem;
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
    font-size: 0.82rem;
  }
`;

const PendingBanner = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px solid #e0a94a;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.75rem;
  line-height: 1.4;
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

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, removeItem, hasUnapprovedPrice } =
    useCart();

  // Esc closes, lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const empty = lines.length === 0;

  return (
    <>
      <Scrim $open={isOpen} onClick={close} aria-hidden={!isOpen} />
      <Panel
        $open={isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!isOpen}
      >
        <Head>
          <h2 id="cart-title">Your cart</h2>
          <CloseBtn type="button" onClick={close} aria-label="Close cart">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </CloseBtn>
        </Head>
        <Body>
          {empty ? (
            <Empty>
              <EmptyIcon aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
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
              <BrowseLink href="/shop" onClick={close}>
                Browse the shop
              </BrowseLink>
            </Empty>
          ) : (
            lines.map((l) => (
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
                        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M5 3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
                  <LinePrice $muted={!l.product.priceApproved}>$—</LinePrice>
                  <Remove
                    type="button"
                    onClick={() => removeItem(l.slug)}
                    aria-label={`Remove ${l.product.name}`}
                  >
                    Remove
                  </Remove>
                </LineRight>
              </Line>
            ))
          )}
        </Body>
        {!empty && (
          <Foot>
            <Totals>
              <dt>Subtotal</dt>
              <dd className={hasUnapprovedPrice ? "muted" : ""}>
                {hasUnapprovedPrice ? "price pending" : "$—"}
              </dd>
              <dt>Shipping</dt>
              <dd className="muted">calculated at checkout</dd>
              <dt>Tax</dt>
              <dd className="muted">calculated at checkout</dd>
            </Totals>
            {hasUnapprovedPrice && (
              <PendingBanner>
                The owner is finalising pricing. You can review your selection
                at checkout — Pay unlocks once prices are approved.
              </PendingBanner>
            )}
            <CheckoutBtn href="/checkout" onClick={close}>
              Continue to checkout
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3 7h8m-3-3 3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CheckoutBtn>
          </Foot>
        )}
      </Panel>
    </>
  );
}
