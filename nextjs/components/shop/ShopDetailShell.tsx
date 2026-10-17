"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "./ProductDetail";
import { Wrap } from "@/components/shared";
import { Product } from "@/lib/products";

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

/**
 * Wraps ProductDetail with the shared Header, Footer and page container.
 * Lives in its own file because every piece needs to be a client component
 * (styled-components).
 */
export default function ShopDetailShell({ product }: { product: Product }) {
  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <ProductDetail product={product} />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
