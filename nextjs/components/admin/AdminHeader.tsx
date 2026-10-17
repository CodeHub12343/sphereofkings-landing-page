"use client";

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

  @media (max-width: 820px) {
    height: auto;
    padding: 12px 0;
    gap: 10px;
    flex-wrap: wrap;
  }
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

const Nav = styled.nav`
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  justify-content: center;

  @media (max-width: 820px) {
    order: 3;
    flex-basis: 100%;
    justify-content: flex-start;
  }
`;

const NavLink = styled(Link)<{ $on: boolean }>`
  font-family: "Inter", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
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
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
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
`;

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/fulfillment", label: "Fulfillment" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/wholesale", label: "Wholesale" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export default function AdminHeader() {
  const pathname = usePathname() ?? "";
  return (
    <Bar>
      <Wrap>
        <Row>
          <Brand href="/admin" aria-label="Sphere of Kings admin — overview">
            <BrandSphere aria-hidden="true" />
            Sphere of Kings
            <Badge>Admin</Badge>
          </Brand>
          <Nav aria-label="Admin sections">
            {NAV.map((n) => {
              const on =
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <NavLink key={n.href} href={n.href} $on={on}>
                  {n.label}
                </NavLink>
              );
            })}
          </Nav>
          <Right>
            <ExitLink href="/">Exit admin</ExitLink>
            <Ava aria-label="Signed in as owner">EA</Ava>
          </Right>
        </Row>
      </Wrap>
    </Bar>
  );
}
