"use client";

import styled from "styled-components";
import Link from "next/link";
import { Product, formatMoney } from "@/lib/products";

// Kickstarter-only mode (James, 2026-11-20 chat): every reward card is a
// preview of what is on the Kickstarter campaign. The card shows the
// Kickstarter pledge amount only — no retail/sale split, no inventory
// bar — and the CTA links straight to the campaign.
const KICKSTARTER_URL =
  process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "/#signup";

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
  const priceLabel = product.price
    ? formatMoney(product.price.amount, product.price.currency)
    : "Pledge TBD";
  const isExternal = KICKSTARTER_URL.startsWith("http");

  return (
    <Card $featured={featured}>
      <Media>
        <Link href={`/shop/${product.slug}`} aria-label={`${product.name} — view details`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.alt} loading="lazy" />
        </Link>
      </Media>
      <Eyebrow>
        <Pill $tone="gold">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M5 1 6.2 3.6 9 4l-2 2 .5 2.8L5 7.5 2.5 8.8 3 6 1 4l2.8-.4L5 1Z"
              fill="currentColor"
            />
          </svg>
          Kickstarter Reward
        </Pill>
      </Eyebrow>
      <Body>
        <Name>
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </Name>
        <Desc>{product.description}</Desc>
      </Body>
      <Foot>
        <PriceRow>
          <Price>{priceLabel}</Price>
          <PriceNote>Kickstarter pledge</PriceNote>
        </PriceRow>
        <SecondaryAction
          href={KICKSTARTER_URL}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          View on Kickstarter →
        </SecondaryAction>
      </Foot>
    </Card>
  );
}
