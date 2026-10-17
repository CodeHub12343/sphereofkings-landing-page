"use client";

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDashboard from "@/components/affiliate/AffiliateDashboard";
import { Wrap } from "@/components/shared";

const Section = styled.section`
  padding: clamp(28px, 4vw, 56px) 0 clamp(60px, 8vw, 112px);
  background: #0a0a0a;
`;

const DemoBar = styled.div`
  background: rgba(224, 169, 74, 0.08);
  border: 1px solid #e0a94a;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  color: #e0a94a;
  display: flex;
  gap: 10px;
  align-items: center;
  line-height: 1.4;
  margin-bottom: 20px;

  svg {
    flex-shrink: 0;
  }
  strong {
    color: #f5f0e8;
  }
`;

export default function AffiliatePage() {
  return (
    <>
      <Header />
      <main>
        <Section>
          <Wrap>
            <DemoBar role="note">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M8 4.5v4m0 2v.3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                <strong>Demo view.</strong> This page is not yet gated per
                affiliate — the dashboard shows a sample account (POSTER-247).
                Wire up affiliate sign-in and a server data source before
                sharing the URL.
              </span>
            </DemoBar>
            <AffiliateDashboard />
          </Wrap>
        </Section>
      </main>
      <Footer />
    </>
  );
}
