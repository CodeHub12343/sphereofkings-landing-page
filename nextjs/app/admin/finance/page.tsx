"use client";

import styled from "styled-components";
import { Wrap } from "@/components/shared";
import DemoBanner from "@/components/admin/DemoBanner";
import FinanceDashboard from "@/components/admin/FinanceDashboard";

const Page = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(48px, 7vw, 96px);
`;

export default function AdminFinancePage() {
  return (
    <Page>
      <Wrap>
        <DemoBanner />
        <FinanceDashboard />
      </Wrap>
    </Page>
  );
}
