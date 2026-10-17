"use client";

import { useState } from "react";
import styled from "styled-components";
import { BtnGoldLink, Wrap } from "./shared";
import CartIcon from "./cart/CartIcon";
import CartDrawer from "./cart/CartDrawer";

const HeaderEl = styled.header<{ $open: boolean }>`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1a1510;

  .site-nav {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }

  @media (max-width: 720px) {
    .site-nav {
      order: 4;
      flex-basis: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      max-height: ${(p) => (p.$open ? "420px" : "0")};
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      border-top: 1px solid ${(p) => (p.$open ? "#1a1510" : "transparent")};
      padding-bottom: ${(p) => (p.$open ? "12px" : "0")};
      background: #0a0a0a;
    }
    .site-nav a {
      padding: 14px 4px;
      border-bottom: 1px solid #1a1510;
      font-size: 1rem;
    }
    .site-cta {
      display: ${(p) => (p.$open ? "inline-block" : "none")};
      order: 5;
      flex-basis: 100%;
      text-align: center;
      margin-bottom: 10px;
    }
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  gap: 20px;

  @media (max-width: 720px) {
    height: auto;
    min-height: 64px;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 10px;
    padding-bottom: 10px;
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

  @media (max-width: 720px) {
    display: block;
    order: 3;
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

const NAV = [
  ["/shop", "Shop"],
  ["/how-to-play", "How to Play"],
  ["/#video", "Video"],
  ["/wholesale", "Wholesale"],
  ["/affiliate", "Affiliate"],
  ["/donate", "Donate"],
  ["/#contact", "Contact"],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <HeaderEl $open={open}>
      <Wrap>
        <Row>
          <Logo href="/" aria-label="Sphere of Kings — back to top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/b17be116-af38-47af-9813-ffa3c2aec5e7.jpg"
              alt="Sphere of Kings 7 in 1"
            />
          </Logo>
          <Toggle
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
            $open={open}
          >
            <span />
            <span />
            <span />
          </Toggle>
          <nav id="site-nav" className="site-nav" aria-label="Page sections">
            {NAV.map(([href, label]) => (
              <NavLink key={href} href={href} onClick={close}>
                {label}
              </NavLink>
            ))}
          </nav>
          <RightRow>
            <Cta href="/#signup" className="site-cta" onClick={close}>
              Notify Me
            </Cta>
            <CartIcon />
          </RightRow>
        </Row>
      </Wrap>
      <CartDrawer />
    </HeaderEl>
  );
}

const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;
