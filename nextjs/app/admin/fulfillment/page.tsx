"use client";

import styled from "styled-components";
import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import FulfillmentView from "@/components/admin/FulfillmentView";

const Page = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px);
`;

const Head = styled.header`
  margin-bottom: 20px;

  h1 {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    margin: 0 0 6px;
    font-weight: 800;
  }
  p {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.92rem;
    margin: 0;
    line-height: 1.55;
    max-width: 640px;
  }
`;

export default function AdminFulfillmentPage() {
  return (
    <Page>
      <Wrap>
        <DemoBanner />
        <Head>
          <h1>Fulfillment</h1>
          <p>
            One paid Early Bird order at a time. Tick Produced → Packed →
            Dispatched as you work. Changes are kept locally in this session
            until the backend is wired.
          </p>
        </Head>
        <FulfillmentView />
      </Wrap>
    </Page>
  );
}
