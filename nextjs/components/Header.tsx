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
// below — keep them in sync. +40px when the Kickstarter strip renders
// (it adds its own row above the nav row inside the same fixed block).
const HeaderSpacer = styled.div<{ $withBar?: boolean }>`
  height: ${(p) => (p.$withBar ? "110px" : "70px")};

  @media (max-width: 720px) {
    height: ${(p) => (p.$withBar ? "112px" : "64px")};
  }
`;

// Kickstarter-only-mode strip (James, 2026-10-29). Lives INSIDE the
// fixed header so it scrolls with the nav as one unit instead of being
// overlapped by it — a standalone fixed banner above a fixed header
// just gets painted over, since fixed elements position against the
// viewport, not document flow.
const KsBar = styled.div`
  background: linear-gradient(90deg, #15110c 0%, #2a1b06 50%, #15110c 100%);
  border-bottom: 1px solid #c9a227;
  color: #f5f0e8;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  padding: 8px 0;
`;

const KsBarInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(14px, 3vw, 28px);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  strong { color: #f0c040; }
  span { color: #d1c7b4; }
  @media (max-width: 640px) {
    font-size: 0.74rem;
  }
`;

const KsDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4fb07d;
  box-shadow: 0 0 10px rgba(79, 176, 125, 0.7);
  flex-shrink: 0;
`;

const KsCta = styled.a`
  color: #0a0a0a;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  white-space: nowrap;
`;

const KICKSTARTER_URL =
  process.env.NEXT_PUBLIC_KICKSTARTER_URL ?? "/#signup";

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  gap: 16px;

  @media (max-width: 980px) {
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

/* Desktop nav: single-row inline links. Shrinks gap/font as viewport
   narrows so all 10 items stay on one line down to ~980px; the mobile
   drawer takes over below that. */
const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.6vw, 22px);
  flex-wrap: nowrap;
  min-width: 0;
  flex: 1;
  justify-content: center;

  @media (max-width: 980px) {
    display: none;
  }
`;

const NavLink = styled.a<{ $accent?: boolean }>`
  color: ${(p) => (p.$accent ? "#f0c040" : "#7a6a5a")};
  text-decoration: none;
  font-size: clamp(0.78rem, 0.9vw, 0.88rem);
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition: color 0.2s;
  font-weight: ${(p) => (p.$accent ? 600 : 400)};
  ${(p) => p.$accent && `
    border: 1px solid #2e2618;
    border-radius: 999px;
    padding: 4px 10px;
    background: rgba(201, 162, 39, 0.08);
  `}

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

const GroupWrap = styled.div`
  position: relative;
`;

const GroupBtn = styled.button<{ $open: boolean }>`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${(p) => (p.$open ? "#f0c040" : "#7a6a5a")};
  font-size: clamp(0.78rem, 0.9vw, 0.88rem);
  letter-spacing: 0.03em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  &:hover { color: #f0c040; }
`;

const GroupPanel = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  /* Transparent top padding keeps the hover zone contiguous with the button,
     so the cursor can move from the label to the menu without passing
     through dead space that would trigger mouseleave and snap the panel shut. */
  padding-top: 10px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  display: ${(p) => (p.$open ? "flex" : "none")};
  flex-direction: column;
  z-index: 1101;

  /* The visible chrome lives on a child wrapper so it sits BELOW the gap. */
  & > div.panel-body {
    background: #0e0c08;
    border: 1px solid #1a1510;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    padding: 6px;
    display: flex;
    flex-direction: column;
  }

  a {
    color: #f5f0e8;
    text-decoration: none;
    font-size: 0.86rem;
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
    &:hover { background: #1a1510; color: #f0c040; }
  }
`;

const Cta = styled(BtnGoldLink)`
  flex-shrink: 0;
  padding: 10px 22px;
  font-size: 0.82rem;

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

// "Shop" renamed to "Rewards" — the page now previews what the
// Kickstarter campaign offers rather than routing to a direct-sale
// checkout (James, 2026-10-29).
// Two flagship pills + three grouped dropdowns keeps the row short and
// scans at a glance. Related pages collapse under their parent so the
// row no longer overflows at the top of the viewport.
type NavItem =
  | { kind: "link"; href: string; label: string; accent?: boolean }
  | { kind: "group"; label: string; children: { href: string; label: string }[] };

const NAV: NavItem[] = [
  { kind: "link",  href: "/create",    label: "Design your sphere", accent: true },
  { kind: "link",  href: "/creators",  label: "Creator Kingdom", accent: true },
  { kind: "group", label: "Play", children: [
    { href: "/play",         label: "Play online" },
    { href: "/how-to-play",  label: "How to play" },
    { href: "/videos",       label: "Videos" },
  ]},
  { kind: "group", label: "Shop", children: [
    { href: "/shop",         label: "Rewards" },
    { href: "/sweepstakes",  label: "Giveaway" },
    { href: "/wholesale",    label: "Wholesale" },
  ]},
  { kind: "group", label: "About", children: [
    { href: "/our-story",    label: "Our story" },
    { href: "/mission",      label: "Mission & giving" },
    { href: "/sponsorship",  label: "Sponsor" },
    { href: "/affiliate",    label: "Affiliate" },
    { href: "/donate",       label: "Donate" },
    { href: "/#contact",     label: "Contact" },
  ]},
];

// Takes the submenu entries as `items` rather than the reserved React
// `children` prop so React doesn't try to render them as JSX children.
function NavGroup({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(`[data-nav-group="${label}"]`)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, label]);
  return (
    <GroupWrap
      data-nav-group={label}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Click just opens — it doesn't toggle, because hover already opened
          the panel and a toggle would immediately snap it shut. The outside
          mousedown / Escape / mouseleave handlers below do the closing. */}
      <GroupBtn $open={open} onClick={() => setOpen(true)}
                aria-haspopup="menu" aria-expanded={open}>
        {label}
        <span aria-hidden="true" style={{ fontSize: "0.65em" }}>▾</span>
      </GroupBtn>
      <GroupPanel $open={open} role="menu">
        <div className="panel-body">
          {items.map((c) => (
            <a key={c.href} href={c.href} role="menuitem" onClick={() => setOpen(false)}>
              {c.label}
            </a>
          ))}
        </div>
      </GroupPanel>
    </GroupWrap>
  );
}

export default function Header({ kickstarterBar = false }: { kickstarterBar?: boolean }) {
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

  const isExternal = KICKSTARTER_URL.startsWith("http");

  return (
    <>
      <HeaderSpacer aria-hidden="true" $withBar={kickstarterBar} />
      <HeaderEl>
        {kickstarterBar && (
          <KsBar>
            <KsBarInner>
              <KsDot aria-hidden="true" />
              <strong>Live on Kickstarter.</strong>{" "}
              <span>All Sphere of Kings orders go through our campaign.</span>
              <KsCta
                href={KICKSTARTER_URL}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
              >
                Back the campaign →
              </KsCta>
            </KsBarInner>
          </KsBar>
        )}
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
            {NAV.map((item) => item.kind === "link" ? (
              <NavLink key={item.href} href={item.href} $accent={item.accent}>
                {item.label}
              </NavLink>
            ) : (
              <NavGroup key={item.label} label={item.label} items={item.children} />
            ))}
          </DesktopNav>
          <RightRow>
            <Cta href="/#signup">Notify Me</Cta>
            {/* CartIcon hidden — all sales routed through Kickstarter
                (James, 2026-10-29). Restore when direct sales resume. */}
            {false && <CartIcon />}
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
        {NAV.map((item) => item.kind === "link" ? (
          <DrawerLink key={item.href} href={item.href} onClick={close}
                      style={item.accent ? { color: "#f0c040" } : undefined}>
            {item.label}
          </DrawerLink>
        ) : (
          <div key={item.label}
               style={{ display: "flex", flexDirection: "column",
                        borderBottom: "1px solid #1a1510", padding: "12px 4px 4px" }}>
            <div style={{ color: "#7a6a5a", fontSize: "0.75rem", textTransform: "uppercase",
                          letterSpacing: "0.1em", marginBottom: 4 }}>{item.label}</div>
            {item.children.map((c) => (
              <DrawerLink key={c.href} href={c.href} onClick={close}
                          style={{ paddingLeft: 10, fontSize: "0.98rem", border: "none" }}>
                {c.label}
              </DrawerLink>
            ))}
          </div>
        ))}
        <DrawerCta href="/#signup" onClick={close}>
          Notify Me
        </DrawerCta>
      </Drawer>
      </HeaderEl>
    </>
  );
}
