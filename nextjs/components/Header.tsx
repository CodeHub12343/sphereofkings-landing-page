"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { BtnGoldLink, Wrap } from "./shared";
import CartIcon from "./cart/CartIcon";

const HeaderEl = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1a1510;
`;

// Spacer that reserves vertical room equal to the fixed header so page
// content never slides under it. The height mirrors the Row heights
// below — keep them in sync.
const HeaderSpacer = styled.div`
  height: 70px;

  @media (max-width: 720px) {
    height: 64px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  gap: 20px;

  @media (max-width: 720px) {
    height: 64px;
    gap: 12px;
  }
`;

const Logo = styled.a`
  flex-shrink: 0;

  img {
    height: 42px;
    object-fit: contain;
    display: block;

    @media (max-width: 420px) {
      height: 36px;
    }
  }
`;

/* Desktop nav: inline links. Hidden on mobile. */
const DesktopNav = styled.nav`
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #7a6a5a;
  text-decoration: none;
  font-size: 0.88rem;
  letter-spacing: 0.03em;
  transition: color 0.2s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const Cta = styled(BtnGoldLink)`
  flex-shrink: 0;
  padding: 10px 22px;
  font-size: 0.82rem;

  @media (max-width: 720px) {
    display: none;
  }
`;

const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const Toggle = styled.button<{ $open: boolean }>`
  display: none;
  background: transparent;
  border: 1px solid #2e2618;
  border-radius: 6px;
  width: 42px;
  height: 42px;
  padding: 0;
  cursor: pointer;
  position: relative;
  z-index: 1102;

  @media (max-width: 720px) {
    display: block;
  }

  span {
    display: block;
    position: absolute;
    left: 10px;
    right: 10px;
    height: 2px;
    background: #c9a227;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.2s, top 0.25s;
  }
  span:nth-child(1) {
    top: ${(p) => (p.$open ? "20px" : "13px")};
    transform: ${(p) => (p.$open ? "rotate(45deg)" : "none")};
  }
  span:nth-child(2) {
    top: 20px;
    opacity: ${(p) => (p.$open ? 0 : 1)};
  }
  span:nth-child(3) {
    top: ${(p) => (p.$open ? "20px" : "27px")};
    transform: ${(p) => (p.$open ? "rotate(-45deg)" : "none")};
  }
`;

/* Mobile slide-in drawer. */
const Scrim = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 720px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1099;
    opacity: ${(p) => (p.$open ? 1 : 0)};
    pointer-events: ${(p) => (p.$open ? "auto" : "none")};
    transition: opacity 0.25s ease;
  }
`;

const Drawer = styled.nav<{ $open: boolean }>`
  display: none;

  @media (max-width: 720px) {
    display: flex;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    height: 100dvh;
    width: min(320px, 85vw);
    background: #0a0a0a;
    border-left: 1px solid #1a1510;
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);
    z-index: 1100;
    transform: translateX(${(p) => (p.$open ? "0" : "100%")});
    transition: transform 0.3s ease;
    flex-direction: column;
    padding: calc(env(safe-area-inset-top) + 72px) 20px
      calc(env(safe-area-inset-bottom) + 20px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
`;

const DrawerLink = styled.a`
  color: #f5f0e8;
  text-decoration: none;
  font-family: "Inter", sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 16px 4px;
  border-bottom: 1px solid #1a1510;
  transition: color 0.2s, padding-left 0.2s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
    padding-left: 8px;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const DrawerCta = styled(BtnGoldLink)`
  margin-top: 20px;
  text-align: center;
  padding: 14px 22px;
  font-size: 0.95rem;
`;

const NAV = [
  ["/shop", "Shop"],
  ["/how-to-play", "How to Play"],
  ["/videos", "Videos"],
  ["/sweepstakes", "Giveaway"],
  ["/our-story", "Our Story"],
  ["/wholesale", "Wholesale"],
  ["/affiliate", "Affiliate"],
  ["/donate", "Donate"],
  ["/#contact", "Contact"],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Esc closes; lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <HeaderSpacer aria-hidden="true" />
      <HeaderEl>
        <Wrap>
        <Row>
          <Logo href="/" aria-label="Sphere of Kings — back to top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/b17be116-af38-47af-9813-ffa3c2aec5e7.jpg"
              alt="Sphere of Kings 7 in 1"
            />
          </Logo>
          <DesktopNav aria-label="Page sections">
            {NAV.map(([href, label]) => (
              <NavLink key={href} href={href}>
                {label}
              </NavLink>
            ))}
          </DesktopNav>
          <RightRow>
            <Cta href="/#signup">Notify Me</Cta>
            <CartIcon />
            <Toggle
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="site-nav-drawer"
              onClick={() => setOpen((o) => !o)}
              $open={open}
            >
              <span />
              <span />
              <span />
            </Toggle>
          </RightRow>
        </Row>
      </Wrap>
      <Scrim $open={open} onClick={close} aria-hidden={!open} />
      <Drawer
        id="site-nav-drawer"
        $open={open}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        {NAV.map(([href, label]) => (
          <DrawerLink key={href} href={href} onClick={close}>
            {label}
          </DrawerLink>
        ))}
        <DrawerCta href="/#signup" onClick={close}>
          Notify Me
        </DrawerCta>
      </Drawer>
      </HeaderEl>
    </>
  );
}
