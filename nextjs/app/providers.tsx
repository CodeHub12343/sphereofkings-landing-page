"use client";

import { CartProvider } from "@/lib/cart";
import CartToast from "@/components/cart/CartToast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartToast />
    </CartProvider>
  );
}
