"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryNotice from "@/components/shop/DeliveryNotice";
import ProductCard from "@/components/shop/ProductCard";
import { Wrap, GoldTitle, SectionEyebrow } from "@/components/shared";
import { PRODUCTS } from "@/lib/products";

const Section = styled.section`
  padding: clamp(48px, 7vw, 96px) 0 clamp(60px, 8vw, 112px);
  background: var(--bg, #0a0a0a);
`;

const Heading = styled(GoldTitle)`
  text-align: center;
  font-size: clamp(2rem, 4.5vw, 3rem);
  margin: 0 0 10px;
  font-weight: 900;
`;

const Lede = styled.p`
  text-align: center;
  color: #a89880;
  font-size: 1.02rem;
  line-height: 1.55;
  max-width: 640px;
  margin: 0 auto 28px;
`;

const NoticeRow = styled.div`
  max-width: 820px;
  margin: 0 auto 44px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
`;

const Legal = styled.p`
  text-align: center;
  color: #5a4a38;
  font-size: 0.78rem;
  line-height: 1.55;
  margin: 28px auto 0;
  max-width: 640px;
`;

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        <Section id="shop">
          <Wrap>
            <SectionEyebrow>Christmas Early Bird Shop</SectionEyebrow>
            <Heading>Seven games. One royal sphere.</Heading>
            <Lede>
              Preorder now to join the first families playing on Christmas
              morning. Each product is capped at 1,000 units. Prices are being
              finalised by the owner — the shop will enable Add to cart once
              they are approved.
            </Lede>
            <NoticeRow>
              <DeliveryNotice variant="early-bird" />
            </NoticeRow>
            <Grid>
              {PRODUCTS.map((p, i) => (
                <ProductCard key={p.slug} product={p} featured={i === 0} />
              ))}
            </Grid>
            <Legal>
              Inventory numbers shown reflect current demand. Final prices,
              shipping fees and taxes are configured before any charge is
              taken. We ship Early Bird orders in the sequence they are paid.
            </Legal>
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
