"use client";

import styled from "styled-components";
import Link from "next/link";
import { Wrap, SectionEyebrow, GoldTitle } from "./shared";
import ProductCard from "./shop/ProductCard";
import { PRODUCTS } from "@/lib/products";

// Landing-page preview — four products, the fifth lives on the full /shop
// page. Pulls from the real catalog so nothing is invented.
const FEATURED = PRODUCTS.slice(0, 4);

const Section = styled.section`
  padding: var(--section-pad) 0;
  background: var(--bg);
`;

const Head = styled.header`
  text-align: center;
  margin-bottom: 44px;
`;

const Heading = styled(GoldTitle).attrs({ as: "h2" })`
  text-align: center;
  font-size: clamp(1.8rem, 3.5vw, 2.7rem);
  margin: 0 0 10px;
  font-weight: 900;
`;

const Lede = styled.p`
  color: #a89880;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 28px;
`;

const MoreRow = styled.div`
  text-align: center;
`;

const MoreLink = styled(Link)`
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 12px 28px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #c9a227;
  color: #f0c040;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s, box-shadow 0.2s;

  &:hover {
    background: rgba(201, 162, 39, 0.08);
    box-shadow: 0 0 24px rgba(201, 162, 39, 0.15);
  }
  &:focus-visible {
    outline: 2px solid #f0c040;
    outline-offset: 3px;
  }
`;

export default function KingdomCollection() {
  return (
    <Section id="collection">
      <Wrap>
        <Head>
          <SectionEyebrow>The Kingdom Collection</SectionEyebrow>
          <Heading>Find Your Sphere.</Heading>
          <Lede>
            Discover the Sphere of Kings collection, from individual
            experiences to complete sets for families, collectors, schools
            and game groups.
          </Lede>
        </Head>
        <Grid>
          {FEATURED.map((p, i) => (
            <ProductCard key={p.slug} product={p} featured={i === 0} />
          ))}
        </Grid>
        <MoreRow>
          <MoreLink href="/shop">
            View the full shop
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6h8m-3-3 3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MoreLink>
        </MoreRow>
      </Wrap>
    </Section>
  );
}
