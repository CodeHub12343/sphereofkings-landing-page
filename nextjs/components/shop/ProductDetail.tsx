"use client";

import { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import DeliveryNotice from "./DeliveryNotice";
import { Product, availability, formatMoney } from "@/lib/products";
import { useCart } from "@/lib/cart";
import FullDetailsTrigger from "./FullDetailsTrigger";

const Crumbs = styled.nav`
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  color: #a89880;
  margin-bottom: 24px;

  a {
    color: #a89880;
    text-decoration: none;
    transition: color 0.2s;
  }
  a:hover {
    color: #f0c040;
  }
  span[aria-hidden] {
    margin: 0 8px;
    color: #3a3025;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const Gallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Main = styled.div`
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #1e1a12;
  background: #0e0c09;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Thumbs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const Thumb = styled.button<{ $active: boolean }>`
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(p) => (p.$active ? "#c9a227" : "#1e1a12")};
  background: #0e0c09;
  padding: 0;
  cursor: pointer;
  box-shadow: ${(p) =>
    p.$active ? "0 0 0 2px rgba(201, 162, 39, 0.25)" : "none"};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #c9a227;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PillRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Pill = styled.span<{ $tone: "gold" | "warn" | "muted" | "royal" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  ${(p) =>
    p.$tone === "gold" &&
    "background: rgba(201,162,39,0.14); color: #f0c040;"}
  ${(p) =>
    p.$tone === "warn" &&
    "background: rgba(224,169,74,0.14); color: #e0a94a;"}
  ${(p) =>
    p.$tone === "muted" &&
    "background: rgba(255,255,255,0.04); color: #a89880;"}
  ${(p) =>
    p.$tone === "royal" &&
    "background: rgba(76,124,224,0.14); color: #7fa3ff;"}
`;

const PillDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  line-height: 1.15;
  color: #f5f0e8;
  margin: 0;
  font-weight: 800;
`;

const Lede = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #a89880;
  margin: 0;
`;

const PricePanel = styled.div`
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PriceTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const PriceBig = styled.span<{ $muted?: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const PriceNote = styled.span`
  font-size: 0.78rem;
  color: #a89880;
  font-weight: 500;
`;

const Bar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $tone: "gold" | "warn" | "muted" }>`
  height: 100%;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: ${(p) =>
    p.$tone === "warn" ? "#e0a94a" : p.$tone === "muted" ? "#5a4a38" : "#c9a227"};
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const BarMeta = styled.div<{ $tone: "default" | "warn" }>`
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: ${(p) => (p.$tone === "warn" ? 600 : 500)};
  color: ${(p) => (p.$tone === "warn" ? "#e0a94a" : "#a89880")};
`;

const BuyRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: stretch;
`;

const QtyBox = styled.div`
  display: inline-flex;
  align-items: center;
  background: #1a1612;
  border: 1px solid #2e2618;
  border-radius: 8px;
  overflow: hidden;
  width: fit-content;
`;

const QtyBtn = styled.button`
  width: 42px;
  height: 44px;
  background: transparent;
  border: 0;
  color: #f5f0e8;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    color: #f0c040;
    background: rgba(201, 162, 39, 0.08);
  }
  &:disabled {
    color: #3a3025;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: -2px;
  }
`;

const QtyInput = styled.input`
  width: 56px;
  height: 44px;
  background: transparent;
  border: 0;
  color: #f5f0e8;
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &:focus {
    outline: 2px solid #c9a227;
    outline-offset: -2px;
  }

  /* hide number spinner */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const BuyBtn = styled.button`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0 24px;
  border-radius: 8px;
  border: 0;
  cursor: pointer;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  transition: box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    box-shadow: 0 0 24px rgba(240, 192, 64, 0.3);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const NotifyLink = styled.a`
  font-family: "Inter", sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #2e2618;
  background: transparent;
  color: #f5f0e8;
  text-decoration: none;
  text-align: center;
  display: inline-block;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: #c9a227;
    color: #f0c040;
  }
`;

const FactList = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 20px;
  margin: 0;
  padding: 18px 20px;
  background: #0e0c09;
  border: 1px solid #1e1a12;
  border-radius: 12px;

  dt {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a89880;
    font-weight: 600;
  }
  dd {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    color: #f5f0e8;
  }
`;

const Fine = styled.p`
  font-size: 0.78rem;
  line-height: 1.55;
  color: #5a4a38;
  margin: 0;
`;

export default function ProductDetail({ product, children }: { product: Product; children?: React.ReactNode }) {
  const avail = availability(product);
  const soldOut = avail.kind === "sold-out";
  const lowStock = avail.kind === "low-stock";
  const barTone: "gold" | "warn" | "muted" = soldOut
    ? "muted"
    : lowStock
    ? "warn"
    : "gold";
  const pct = (product.unitsSold / product.inventoryCap) * 100;
  const maxQty = soldOut ? 0 : Math.min(10, avail.remaining);

  const [qty, setQty] = useState(1);
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(maxQty || 1, q + 1));
  const onInput = (v: string) => {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return setQty(1);
    setQty(Math.max(1, Math.min(maxQty || 1, n)));
  };

  const canAdd = !soldOut && product.purchasable;
  const { addItem } = useCart();

  return (
    <>
      <Crumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "#f5f0e8" }}>{product.name}</span>
      </Crumbs>

      <Layout>
        <Gallery>
          <Main>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.alt} />
          </Main>
          <Thumbs aria-label="Gallery thumbnails">
            <Thumb $active aria-current="true" aria-label="Main view">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" />
            </Thumb>
            <Thumb $active={false} disabled aria-label="Additional views coming">
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "100%",
                  height: "100%",
                  color: "#5a4a38",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Soon
              </span>
            </Thumb>
            <Thumb $active={false} disabled aria-label="Additional views coming">
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "100%",
                  height: "100%",
                  color: "#5a4a38",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Soon
              </span>
            </Thumb>
            <Thumb $active={false} disabled aria-label="Additional views coming">
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "100%",
                  height: "100%",
                  color: "#5a4a38",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Soon
              </span>
            </Thumb>
          </Thumbs>
        </Gallery>

        <Body>
          <PillRow>
            {soldOut ? (
              <Pill $tone="muted">Sold out</Pill>
            ) : (
              <Pill $tone="gold">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M5 1 6.2 3.6 9 4l-2 2 .5 2.8L5 7.5 2.5 8.8 3 6 1 4l2.8-.4L5 1Z"
                    fill="currentColor"
                  />
                </svg>
                Christmas Early Bird
              </Pill>
            )}
            {lowStock && (
              <Pill $tone="warn">
                <PillDot aria-hidden="true" />
                {avail.remaining} left
              </Pill>
            )}
            {!product.priceApproved && (
              <Pill $tone="royal">
                <PillDot aria-hidden="true" />
                Price pending approval
              </Pill>
            )}
          </PillRow>

          <Title>{product.name}</Title>
          <Lede>{product.description}</Lede>
          {product.fullDescription && (
            <FullDetailsTrigger
              title={product.name}
              bodyMarkdown={product.fullDescription}
            />
          )}

          <PricePanel>
            <PriceTop>
              <PriceBig $muted={!product.priceApproved}>
                {product.priceApproved && product.price
                  ? formatMoney(product.price.amount, product.price.currency)
                  : "$—"}
              </PriceBig>
              <PriceNote>
                {product.priceApproved
                  ? "Shipping and tax calculated at checkout"
                  : "The owner is finalising pricing — Add to cart will enable once approved"}
              </PriceNote>
            </PriceTop>
            <Bar aria-hidden="true">
              <BarFill $pct={pct} $tone={barTone} />
            </Bar>
            <BarMeta $tone={lowStock ? "warn" : "default"}>
              <span>{product.unitsSold.toLocaleString()} sold</span>
              <span>
                {soldOut
                  ? `${product.inventoryCap.toLocaleString()} of ${product.inventoryCap.toLocaleString()}`
                  : lowStock
                  ? `${avail.remaining} left of ${product.inventoryCap.toLocaleString()}`
                  : `of ${product.inventoryCap.toLocaleString()}`}
              </span>
            </BarMeta>

            {soldOut ? (
              <NotifyLink href="/#signup">Notify me when it returns</NotifyLink>
            ) : (
              <BuyRow>
                <QtyBox role="group" aria-label="Quantity">
                  <QtyBtn
                    type="button"
                    onClick={dec}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </QtyBtn>
                  <QtyInput
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxQty || 1}
                    value={qty}
                    onChange={(e) => onInput(e.target.value)}
                    aria-label="Quantity"
                  />
                  <QtyBtn
                    type="button"
                    onClick={inc}
                    disabled={qty >= (maxQty || 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </QtyBtn>
                </QtyBox>
                <BuyBtn
                  type="button"
                  disabled={!canAdd}
                  onClick={() => canAdd && addItem(product.slug, qty)}
                >
                  Add {qty > 1 ? `${qty} ` : ""}to cart
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3 7h8m-3-3 3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </BuyBtn>
              </BuyRow>
            )}
          </PricePanel>

          {/* Puzzle picker / photo uploader slot (ShopDetailShell injects
              these when product.puzzleOptions / requiresPhotoUpload). */}
          {children}

          <DeliveryNotice variant="early-bird" />

          <FactList>
            <dt>Inventory cap</dt>
            <dd>{product.inventoryCap.toLocaleString()} units</dd>
            <dt>Delivery</dt>
            <dd>Starts December 1, 2026 · shipped in paid order</dd>
            <dt>Kickstarter</dt>
            <dd>Separate channel · deliveries expected mid-December 2026</dd>
            <dt>Returns</dt>
            <dd style={{ color: "#a89880" }}>Policy pending owner approval</dd>
          </FactList>

          <Fine>
            Order sequence applies to Early Bird dispatch. We never charge
            before Stripe confirms the payment, and we never promise an
            arrival date — only a dispatch start.
          </Fine>
        </Body>
      </Layout>
    </>
  );
}
