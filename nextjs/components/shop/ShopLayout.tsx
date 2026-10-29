"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryNotice from "@/components/shop/DeliveryNotice";
import ProductCard from "@/components/shop/ProductCard";
import { Wrap, GoldTitle, SectionEyebrow } from "@/components/shared";
import { Product } from "@/lib/products";

type View = "rewards" | "addons";

function readViewFromUrl(): View {
  if (typeof window === "undefined") return "rewards";
  return new URLSearchParams(window.location.search).get("view") === "addons"
    ? "addons" : "rewards";
}

export default function ShopLayout({ products }: { products: Product[] }) {
  // Owner-signed display order (James, 2026-10-19): rewards first in
  // sortOrder sequence, add-ons last. listProducts() already sorts by
  // sortOrder, so we just partition here.
  const rewards = useMemo(
    () => products.filter((p) => (p.category ?? "reward") === "reward"),
    [products],
  );
  const addons = useMemo(
    () => products.filter((p) => p.category === "addon"),
    [products],
  );

  // The view is purely client-local state. We URL-sync via
  // history.replaceState (no router.replace) so Next.js does NOT
  // re-render the page on tab change — otherwise an in-flight server
  // snapshot can momentarily flash the previous tab back on screen.
  // Initial render is always "rewards" (SSR has no URL); on mount we
  // hydrate from window.location.search so a shared ?view=addons link
  // still lands on the right tab.
  const [view, setView] = useState<View>("rewards");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setView(readViewFromUrl());
    setHydrated(true);
    const onPop = () => setView(readViewFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const switchTo = useCallback((next: View) => {
    setView(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next === "rewards") url.searchParams.delete("view");
    else url.searchParams.set("view", "addons");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const visible = view === "rewards" ? rewards : addons;
  void hydrated; // marker; keeps React consistent on first paint

  return (
    <>
      <Header />
      <main>
        <Section id="shop">
          <Wrap>
            <SectionEyebrow>Kickstarter Rewards</SectionEyebrow>
            <Heading>Seven games. One royal sphere.</Heading>
            <Lede>
              Every reward below ships through our Kickstarter campaign.
              Browse the lineup, then back the campaign to lock in your
              pledge.
            </Lede>
            <KickstarterCta
              href={process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "/#signup"}
              target={(process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "").startsWith("http") ? "_blank" : undefined}
              rel={(process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "").startsWith("http") ? "noreferrer" : undefined}
            >
              Back the Kickstarter campaign →
            </KickstarterCta>

            {products.length === 0 ? (
              <Empty>
                <strong>No products in the catalog yet.</strong>
                The admin hasn&apos;t added any products. Check back soon.
              </Empty>
            ) : (
              <>
                <Tabs role="tablist" aria-label="Catalog section">
                  <Tab
                    role="tab"
                    type="button"
                    aria-selected={view === "rewards"}
                    tabIndex={view === "rewards" ? 0 : -1}
                    $active={view === "rewards"}
                    onClick={() => switchTo("rewards")}
                  >
                    <TabIcon aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2 l2.5 6 6.5.5-5 4.5 1.5 6.5L12 16l-5.5 3.5L8 13 3 8.5 9.5 8z" />
                      </svg>
                    </TabIcon>
                    Rewards
                    <Count $active={view === "rewards"}>{rewards.length}</Count>
                  </Tab>
                  <Tab
                    role="tab"
                    type="button"
                    aria-selected={view === "addons"}
                    tabIndex={view === "addons" ? 0 : -1}
                    $active={view === "addons"}
                    onClick={() => switchTo("addons")}
                  >
                    <TabIcon aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </TabIcon>
                    Add-ons
                    <Count $active={view === "addons"}>{addons.length}</Count>
                  </Tab>
                </Tabs>

                <TabHint $tone={view}>
                  {view === "rewards"
                    ? "The 12 Kickstarter rewards, in the order the owner set."
                    : "Add any of these to the reward you pick. Priced to stack."}
                </TabHint>

                <Grid
                  role="tabpanel"
                  aria-label={view === "rewards" ? "Rewards" : "Add-ons"}
                  key={view /* re-mount so cards fade in cleanly on switch */}
                >
                  {visible.map((p, i) => (
                    <ProductCard key={p.slug} product={p} featured={view === "rewards" && i === 0} />
                  ))}
                </Grid>
              </>
            )}

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
  margin: 0 auto 36px;
`;

/* Segmented tab bar — pill-shaped, Cinzel caps, gold accent.
   Mirrors the chips used across /tournaments and /leaderboards. */
const Tabs = styled.div`
  display: inline-flex;
  margin: 0 auto 10px;
  padding: 5px;
  background: var(--bg2, #0d0b08);
  border: 1px solid var(--border, #2a2218);
  border-radius: 999px;
  gap: 4px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 420px) {
    width: 100%;
    left: 0;
    transform: none;
    display: flex;
    justify-content: stretch;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-family: "Cinzel", Georgia, serif;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: background 0.25s, color 0.25s, box-shadow 0.25s;

  background: ${(p) =>
    p.$active
      ? "linear-gradient(135deg,#b8901e 0%,#f0c040 50%,#b8901e 100%)"
      : "transparent"};
  color: ${(p) => (p.$active ? "#0a0a0a" : "#a89880")};
  box-shadow: ${(p) =>
    p.$active ? "0 2px 14px rgba(240,192,64,0.25)" : "none"};

  &:hover {
    color: ${(p) => (p.$active ? "#0a0a0a" : "#f0c040")};
  }
  &:focus-visible {
    outline: 3px solid #f0c040;
    outline-offset: 3px;
  }

  @media (max-width: 420px) {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    letter-spacing: 0.1em;
  }
`;

const TabIcon = styled.span`
  display: inline-flex;
  align-items: center;
  svg { display: block; }
`;

const Count = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${(p) => (p.$active ? "rgba(10,10,10,0.18)" : "var(--bg3,#111009)")};
  color: ${(p) => (p.$active ? "#0a0a0a" : "#a89880")};
  border: 1px solid ${(p) => (p.$active ? "transparent" : "var(--border,#2a2218)")};
`;

const TabHint = styled.p<{ $tone: View }>`
  text-align: center;
  font-size: 0.84rem;
  color: var(--text-muted, #a89880);
  margin: 0 0 28px;
  letter-spacing: 0.02em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 8px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Legal = styled.p`
  text-align: center;
  color: #5a4a38;
  font-size: 0.78rem;
  line-height: 1.55;
  margin: 44px auto 0;
  max-width: 640px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #a89880;
  font-family: "Inter", sans-serif;
  line-height: 1.55;

  strong {
    display: block;
    color: #f5f0e8;
    font-family: "Cinzel", serif;
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
`;

const KickstarterCta = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 18px auto 0;
  padding: 14px 28px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  border-radius: 999px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  text-align: center;
  box-shadow: 0 10px 30px rgba(240, 192, 64, 0.14);
  transition: box-shadow 0.2s, transform 0.1s;
  &:hover {
    box-shadow: 0 0 32px rgba(240, 192, 64, 0.45);
    transform: translateY(-1px);
  }
  @media (max-width: 640px) {
    font-size: 0.9rem;
    padding: 12px 20px;
  }
`;
