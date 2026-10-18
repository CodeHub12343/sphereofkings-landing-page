"use client";

import styled from "styled-components";
import Link from "next/link";
import { Product, availability, formatMoney } from "@/lib/products";
import { useCart } from "@/lib/cart";

const Card = styled.article<{ $featured?: boolean }>`
  background: #0e0c09;
  border: 1px solid ${(p) => (p.$featured ? "#c9a227" : "#1e1a12")};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: ${(p) =>
    p.$featured ? "0 0 0 1px rgba(201, 162, 39, 0.4), 0 10px 30px rgba(201, 162, 39, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.35)"};

  &:hover {
    transform: translateY(-2px);
    border-color: #c9a227;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  }
`;

const Media = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #0a0a0a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Eyebrow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 0;
  gap: 8px;
`;

const Pill = styled.span<{ $tone: "gold" | "warn" | "muted" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: "Inter", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  ${(p) =>
    p.$tone === "gold" &&
    "background: rgba(201,162,39,0.14); color: #f0c040;"}
  ${(p) =>
    p.$tone === "warn" &&
    "background: rgba(224, 169, 74, 0.14); color: #e0a94a;"}
  ${(p) =>
    p.$tone === "muted" &&
    "background: rgba(255,255,255,0.04); color: #a89880;"}
`;

const Delivery = styled.span`
  font-size: 0.7rem;
  color: #a89880;
`;

const Body = styled.div`
  padding: 10px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const Name = styled.h3`
  font-family: "Cinzel", serif;
  font-size: 1.1rem;
  line-height: 1.25;
  font-weight: 700;
  color: #f5f0e8;
  margin: 0;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }
  a:hover {
    color: #f0c040;
  }
`;

const Desc = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #a89880;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Foot = styled.div`
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
`;

const Price = styled.span<{ $muted?: boolean }>`
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(p) => (p.$muted ? "#5a4a38" : "#f5f0e8")};
  font-variant-numeric: tabular-nums;
`;

const PriceNote = styled.span`
  font-size: 0.7rem;
  color: #a89880;
  font-weight: 500;
`;

const Bar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $tone: "gold" | "warn" | "muted" }>`
  height: 100%;
  width: ${(p) => Math.min(100, Math.max(0, p.$pct))}%;
  background: ${(p) =>
    p.$tone === "warn"
      ? "#e0a94a"
      : p.$tone === "muted"
      ? "#5a4a38"
      : "#c9a227"};
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const BarMeta = styled.div<{ $tone: "default" | "warn" }>`
  display: flex;
  justify-content: space-between;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: ${(p) => (p.$tone === "warn" ? 600 : 500)};
  color: ${(p) => (p.$tone === "warn" ? "#e0a94a" : "#a89880")};
`;

const actionCss = `
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 11px 14px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  border: 1px solid transparent;
  letter-spacing: 0.02em;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:disabled, &[aria-disabled="true"] {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const PrimaryAction = styled.button`
  ${actionCss}
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
`;

const SecondaryAction = styled.a`
  ${actionCss}
  background: transparent;
  border-color: #2e2618;
  color: #f5f0e8;

  &:hover {
    border-color: #c9a227;
    color: #f0c040;
  }
`;

/**
 * Shop collection card. Early Bird framing on the first (featured) card;
 * every other card uses the standard border. Prices and availability
 * come from the catalog — nothing is invented here.
 */
export default function ProductCard({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const { addItem } = useCart();
  const avail = availability(product);
  const sold = product.unitsSold;
  const cap = product.inventoryCap;
  const pct = (sold / cap) * 100;

  const soldOut = avail.kind === "sold-out";
  const lowStock = avail.kind === "low-stock";
  const barTone = soldOut ? "muted" : lowStock ? "warn" : "gold";
  const canAdd = !soldOut && product.purchasable;

  return (
    <Card $featured={featured}>
      <Media>
        <Link href={`/shop/${product.slug}`} aria-label={`${product.name} — view details`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.alt} loading="lazy" />
        </Link>
      </Media>
      <Eyebrow>
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
            Early Bird
          </Pill>
        )}
        <Delivery>{soldOut ? "—" : "Ships from Dec 1"}</Delivery>
      </Eyebrow>
      <Body>
        <Name>
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </Name>
        <Desc>{product.description}</Desc>
      </Body>
      <Foot>
        <PriceRow>
          <Price $muted={!product.priceApproved}>
            {product.priceApproved && product.price
              ? formatMoney(product.price.amount, product.price.currency)
              : "$—"}
          </Price>
          <PriceNote>
            {product.priceApproved
              ? `${sold.toLocaleString()} / ${cap.toLocaleString()} sold`
              : "Price pending"}
          </PriceNote>
        </PriceRow>
        <Bar aria-hidden="true">
          <BarFill $pct={pct} $tone={barTone} />
        </Bar>
        <BarMeta $tone={lowStock ? "warn" : "default"}>
          <span>{sold.toLocaleString()} sold</span>
          <span>
            {soldOut
              ? `${cap.toLocaleString()} of ${cap.toLocaleString()}`
              : lowStock
              ? `${avail.remaining} left of ${cap.toLocaleString()}`
              : `of ${cap.toLocaleString()}`}
          </span>
        </BarMeta>
        {soldOut ? (
          <SecondaryAction href="/#signup">Notify me</SecondaryAction>
        ) : (
          <PrimaryAction
            type="button"
            disabled={!canAdd}
            onClick={() => addItem(product.slug, 1)}
          >
            Add to cart
          </PrimaryAction>
        )}
      </Foot>
    </Card>
  );
}
