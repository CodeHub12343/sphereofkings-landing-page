"use client";

import styled from "styled-components";
import Link from "next/link";
import { useCart } from "@/lib/cart";

const Btn = styled(Link)`
  position: relative;
  background: transparent;
  border: 1px solid #2e2618;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  color: #a89880;
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  text-decoration: none;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #f0c040;
    border-color: #c9a227;
  }
  &:focus-visible {
    outline: 2px solid #c9a227;
    outline-offset: 2px;
  }
`;

const Dot = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  font-family: "Inter", sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-grid;
  place-items: center;
  border: 2px solid #0a0a0a;
`;

/**
 * Cart affordance for the Header. Navigates to the full /cart page and
 * shows a live count badge from the cart context.
 */
export default function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Btn
      href="/cart"
      aria-label={itemCount > 0 ? `Cart — ${itemCount} items` : "Cart — empty"}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M2 3h2.5l1.6 9.5h9l1.9-7H6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="15" r="1.1" fill="currentColor" />
        <circle cx="13.5" cy="15" r="1.1" fill="currentColor" />
      </svg>
      {itemCount > 0 && <Dot aria-hidden="true">{itemCount > 99 ? "99+" : itemCount}</Dot>}
    </Btn>
  );
}
