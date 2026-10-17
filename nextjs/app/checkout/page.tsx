"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { Wrap } from "@/components/shared";

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <CheckoutStepper />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
