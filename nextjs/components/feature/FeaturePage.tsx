"use client";

// Shared layout shell for every /play, /puzzles, /tournaments, /blog,
// /me, /sphere, auth, etc. page. Mirrors the landing's design system:
// fixed site Header, Cinzel heading with gold shimmer, Inter body,
// consistent 1200px Wrap, section eyebrow, site Footer.

import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrap, GoldTitle, SectionEyebrow } from "@/components/shared";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  // When true, the title + subtitle are centered (lands pages / listings).
  // When false (default), left-aligned (match detail, blog detail, forms).
  centered?: boolean;
  // Narrow content area for forms + reading-width pages.
  narrow?: boolean;
  children: React.ReactNode;
  // Optional right-rail element in the title row (e.g. a filter / action).
  action?: React.ReactNode;
}

export default function FeaturePage({
  eyebrow, title, subtitle, centered = false, narrow = false, action, children,
}: Props) {
  return (
    <>
      <Header />
      <Main>
        <Hero>
          <Wrap>
            <HeroRow>
              <HeroText $centered={centered}>
                {eyebrow && <SectionEyebrow style={{ textAlign: centered ? "center" : "left", margin: "0 0 10px" }}>
                  {eyebrow}
                </SectionEyebrow>}
                <Title as="h1" $centered={centered}>{title}</Title>
                {subtitle && <Subtitle $centered={centered}>{subtitle}</Subtitle>}
              </HeroText>
              {action && <HeroAction>{action}</HeroAction>}
            </HeroRow>
          </Wrap>
        </Hero>
        <Body>
          <Wrap>
            {narrow ? <Narrow>{children}</Narrow> : children}
          </Wrap>
        </Body>
      </Main>
      <Footer />
    </>
  );
}

const Main = styled.main`
  min-height: 70vh;
  background: var(--bg);
  padding-top: 70px; /* site header height */

  @media (max-width: 720px) {
    padding-top: 64px;
  }
`;

const Hero = styled.section`
  background: linear-gradient(160deg, #0a0a0a 0%, #0e0c08 55%, #0a0a0a 100%);
  padding: clamp(48px, 7vw, 92px) 0 clamp(32px, 4vw, 48px);
  border-bottom: 1px solid var(--border);
`;

const HeroRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const HeroText = styled.div<{ $centered: boolean }>`
  flex: 1 1 480px;
  min-width: 0;
  text-align: ${(p) => (p.$centered ? "center" : "left")};
  margin: ${(p) => (p.$centered ? "0 auto" : "0")};
`;

const HeroAction = styled.div`
  flex-shrink: 0;
`;

const Title = styled(GoldTitle)<{ $centered: boolean }>`
  font-size: clamp(2rem, 4.2vw, 3.2rem);
  line-height: 1.1;
  margin: 0 0 16px;
  font-weight: 900;
  letter-spacing: -0.015em;
  text-align: ${(p) => (p.$centered ? "center" : "left")};
`;

const Subtitle = styled.p<{ $centered: boolean }>`
  color: var(--text-muted);
  font-size: clamp(0.98rem, 1.3vw, 1.1rem);
  line-height: 1.65;
  margin: 0;
  max-width: ${(p) => (p.$centered ? "640px" : "720px")};
  margin-left: ${(p) => (p.$centered ? "auto" : "0")};
  margin-right: ${(p) => (p.$centered ? "auto" : "0")};
`;

const Body = styled.section`
  padding: clamp(32px, 5vw, 64px) 0 clamp(60px, 7vw, 96px);
`;

const Narrow = styled.div`
  max-width: 540px;
  margin: 0 auto;
`;
