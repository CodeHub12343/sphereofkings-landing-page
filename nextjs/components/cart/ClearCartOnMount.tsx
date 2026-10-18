"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/**
 * Fires `clear()` on the cart once after mount. Dropped onto any page
 * that marks the end of a checkout journey — right now that's the
 * /order/[ref] confirmation — so a buyer who just placed an order
 * doesn't see their old lines carry over on the next shop visit.
 */
export default function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
