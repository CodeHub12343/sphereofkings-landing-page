"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrap } from "@/components/shared";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1a1510;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 64px;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #f5f0e8;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  white-space: nowrap;
`;

const BrandSphere = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 32% 28%,
    #e7cb70 0%,
    #d4af37 25%,
    #8a6e1f 55%,
    #1a1510 85%
  );
  box-shadow: inset -2px -3px 6px rgba(0, 0, 0, 0.55);
  flex-shrink: 0;
`;

const Badge = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(185, 28, 28, 0.14);
  color: #ff6b7a;
  padding: 4px 10px;
  border: 1px solid rgba(255, 107, 122, 0.35);
  border-radius: 4px;
`;

/* Desktop nav: single horizontal row, scrolls sideways if the viewport
   is narrow (prevents the 10-item wrap-mess). Hidden under 900px where
   the drawer takes over. */
const DesktopNav = styled.nav`
  display: flex;
  gap: 2px;
  align-items: center;
  flex: 1;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  white-space: nowrap;
  color: ${(p) => (p.$on ? "#f0c040" : "#a89880")};
  background: ${(p) => (p.$on ? "rgba(201, 162, 39, 0.08)" : "transparent")};
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #f0c040;
    background: rgba(201, 162, 39, 0.06);
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const ExitLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #a89880;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #2e2618;
  border-radius: 6px;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }

  @media (max-width: 540px) {
    display: none;
  }
`;

const Ava = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 0.78rem;
  color: #0a0a0a;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  flex-shrink: 0;
`;

const Toggle = styled.button<{ $open: boolean }>`
  display: none;
  background: transparent;
  border: 1px solid #2e2618;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  position: relative;
  z-index: 1102;
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: block;
  }

  span {
    display: block;
    position: absolute;
    left: 9px;
    right: 9px;
    height: 2px;
    background: #c9a227;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.2s, top 0.25s;
  }
  span:nth-child(1) {
    top: ${(p) => (p.$open ? "19px" : "12px")};
    transform: ${(p) => (p.$open ? "rotate(45deg)" : "none")};
  }
  span:nth-child(2) {
    top: 19px;
    opacity: ${(p) => (p.$open ? 0 : 1)};
  }
  span:nth-child(3) {
    top: ${(p) => (p.$open ? "19px" : "26px")};
    transform: ${(p) => (p.$open ? "rotate(-45deg)" : "none")};
  }
`;

/* Mobile slide-in drawer. */
const Scrim = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 900px) {
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

  @media (max-width: 900px) {
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
    padding: calc(env(safe-area-inset-top) + 72px) 0
      calc(env(safe-area-inset-bottom) + 20px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
`;

const DrawerUser = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid #1a1510;

  .meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-family: "Cinzel", serif;
    color: #f5f0e8;
    font-size: 0.95rem;
    font-weight: 700;
  }
  .email {
    font-family: "Inter", sans-serif;
    color: #a89880;
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DrawerLink = styled(Link)<{ $on: boolean }>`
  color: ${(p) => (p.$on ? "#f0c040" : "#f5f0e8")};
  background: ${(p) =>
    p.$on ? "rgba(201, 162, 39, 0.08)" : "transparent"};
  text-decoration: none;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 20px;
  border-left: 3px solid
    ${(p) => (p.$on ? "#c9a227" : "transparent")};
  transition: color 0.2s, background 0.2s, border-left-color 0.2s;

  &:hover,
  &:focus-visible {
    color: #f0c040;
    background: rgba(201, 162, 39, 0.06);
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: -2px;
  }
`;

const DrawerFoot = styled.div`
  margin-top: auto;
  padding: 18px 20px 0;
  border-top: 1px solid #1a1510;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DrawerExit = styled(Link)`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #a89880;
  text-decoration: none;
  padding: 10px 14px;
  border: 1px solid #2e2618;
  border-radius: 6px;
  text-align: center;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
`;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/fulfillment", label: "Fulfillment" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/wholesale", label: "Wholesale" },
  { href: "/admin/sponsorships", label: "Sponsorships" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/audit", label: "Audit" },
];

type HeaderUser = {
  displayName: string;
  email: string;
  role: string;
};

export default function AdminHeader({
  user = null,
  perAccount = false,
}: {
  user?: HeaderUser | null;
  perAccount?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const onAuthScreen =
    pathname === "/admin/signin" ||
    pathname.startsWith("/admin/signin/") ||
    pathname === "/admin/signout" ||
    pathname.startsWith("/admin/signout/");
  const signedOut = perAccount && !user;
  const showNav = !onAuthScreen && !signedOut;

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

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isOn = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Bar>
      <Wrap>
        <Row>
          <Brand href={showNav ? "/admin" : "/"} aria-label="Sphere of Kings admin">
            <BrandSphere aria-hidden="true" />
            Sphere of Kings
            <Badge>Admin</Badge>
          </Brand>
          {showNav && (
            <DesktopNav aria-label="Admin sections">
              {NAV.map((n) => (
                <NavLink key={n.href} href={n.href} $on={isOn(n.href)}>
                  {n.label}
                </NavLink>
              ))}
            </DesktopNav>
          )}
          <Right>
            {showNav ? (
              <>
                {perAccount && user ? (
                  <ExitLink
                    href="/admin/signout"
                    prefetch={false}
                    title={`${user.email} · ${user.role}`}
                  >
                    Sign out
                  </ExitLink>
                ) : (
                  <ExitLink href="/">Exit admin</ExitLink>
                )}
                <Ava
                  aria-label={
                    user ? `Signed in as ${user.displayName}` : "Admin console"
                  }
                  title={user ? `${user.displayName} · ${user.role}` : undefined}
                >
                  {user ? initials(user.displayName) : "EA"}
                </Ava>
                <Toggle
                  type="button"
                  aria-label={open ? "Close admin menu" : "Open admin menu"}
                  aria-expanded={open}
                  aria-controls="admin-nav-drawer"
                  onClick={() => setOpen((o) => !o)}
                  $open={open}
                >
                  <span />
                  <span />
                  <span />
                </Toggle>
              </>
            ) : (
              <ExitLink href="/">Back to site</ExitLink>
            )}
          </Right>
        </Row>
      </Wrap>
      {showNav && (
        <>
          <Scrim $open={open} onClick={close} aria-hidden={!open} />
          <Drawer
            id="admin-nav-drawer"
            $open={open}
            aria-label="Admin sections"
            aria-hidden={!open}
          >
            {user && (
              <DrawerUser>
                <Ava aria-hidden="true">{initials(user.displayName)}</Ava>
                <div className="meta">
                  <span className="name">{user.displayName}</span>
                  <span className="email">{user.email}</span>
                </div>
              </DrawerUser>
            )}
            {NAV.map((n) => (
              <DrawerLink
                key={n.href}
                href={n.href}
                $on={isOn(n.href)}
                onClick={close}
              >
                {n.label}
              </DrawerLink>
            ))}
            <DrawerFoot>
              {perAccount && user ? (
                <DrawerExit href="/admin/signout" prefetch={false} onClick={close}>
                  Sign out
                </DrawerExit>
              ) : (
                <DrawerExit href="/" onClick={close}>
                  Exit admin
                </DrawerExit>
              )}
            </DrawerFoot>
          </Drawer>
        </>
      )}
    </Bar>
  );
}
