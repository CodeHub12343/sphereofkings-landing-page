"use client";

import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { useCart } from "@/lib/cart";

const slideIn = keyframes`
  from { transform: translate(-50%, -16px); opacity: 0; }
  to   { transform: translate(-50%, 0);     opacity: 1; }
`;

const Shell = styled.div`
  position: fixed;
  left: 50%;
  top: calc(env(safe-area-inset-top) + 90px);
  transform: translateX(-50%);
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: min(360px, calc(100vw - 24px));
  max-width: calc(100vw - 24px);
  background: #0e0c09;
  color: #f5f0e8;
  border: 1px solid #c9a227;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(201, 162, 39, 0.25);
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  animation: ${slideIn} 0.22s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Icon = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  color: #0a0a0a;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
`;

const Message = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ViewCart = styled(Link)`
  font-size: 0.8rem;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 0 16px rgba(240, 192, 64, 0.35);
  }
`;

const Close = styled.button`
  background: transparent;
  border: 0;
  color: #a89880;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    color: #f5f0e8;
  }
`;

/**
 * Global toast rendered once at the root of the app. It subscribes to
 * the cart context so any `addItem` call anywhere surfaces it, with no
 * per-component wiring needed.
 */
export default function CartToast() {
  const { toast, dismissToast } = useCart();
  if (!toast) return null;

  return (
    <Shell role="status" aria-live="polite">
      <Icon aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.3 5 8.8l4.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Icon>
      <Message>{toast.message}</Message>
      <ViewCart href="/cart" onClick={dismissToast}>
        View cart
      </ViewCart>
      <Close type="button" onClick={dismissToast} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </Close>
    </Shell>
  );
}
