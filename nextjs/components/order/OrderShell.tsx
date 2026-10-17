"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderConfirmation from "./OrderConfirmation";
import { Wrap } from "@/components/shared";
import { SampleOrder } from "@/lib/sample-orders";

const Section = styled.section`
  padding: clamp(32px, 5vw, 72px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;

  @media print {
    padding: 0;
    background: #fff;
  }
`;

const Narrow = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const PrintHidden = styled.div`
  @media print {
    display: none;
  }
`;

export default function OrderShell({
  order,
  isDemo = false,
}: {
  order: SampleOrder;
  isDemo?: boolean;
}) {
  return (
    <>
      <PrintHidden>
        <Header />
      </PrintHidden>
      <main>
        <Section>
          <Wrap>
            <Narrow>
              <OrderConfirmation order={order} isDemo={isDemo} />
            </Narrow>
          </Wrap>
        </Section>
      </main>
      <PrintHidden>
        <Footer />
      </PrintHidden>
    </>
  );
}
