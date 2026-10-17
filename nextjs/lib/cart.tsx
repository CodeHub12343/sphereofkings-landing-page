"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { PRODUCTS, Product, availability } from "@/lib/products";

export type CartLine = {
  slug: string;
  qty: number;
};

export type HydratedLine = CartLine & { product: Product };

type Action =
  | { type: "add"; slug: string; qty?: number }
  | { type: "set"; slug: string; qty: number }
  | { type: "remove"; slug: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const STORAGE_KEY = "sok.cart.v1";
const MAX_PER_LINE = 10;

function reduce(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const qty = action.qty ?? 1;
      const existing = state.find((l) => l.slug === action.slug);
      const next = existing
        ? state.map((l) =>
            l.slug === action.slug
              ? { ...l, qty: Math.min(MAX_PER_LINE, l.qty + qty) }
              : l,
          )
        : [...state, { slug: action.slug, qty: Math.min(MAX_PER_LINE, qty) }];
      return next;
    }
    case "set":
      return state
        .map((l) =>
          l.slug === action.slug
            ? { ...l, qty: Math.max(0, Math.min(MAX_PER_LINE, action.qty)) }
            : l,
        )
        .filter((l) => l.qty > 0);
    case "remove":
      return state.filter((l) => l.slug !== action.slug);
    case "clear":
      return [];
    default:
      return state;
  }
}

type CartContextValue = {
  lines: HydratedLine[];
  itemCount: number;
  addItem: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  hasUnapprovedPrice: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reduce, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount. We swallow parse errors — a
  // corrupt cart falls back to empty rather than crashing the app.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          const sanitized = parsed
            .filter((l) => typeof l?.slug === "string" && typeof l?.qty === "number")
            .map((l) => ({ slug: l.slug, qty: Math.max(1, Math.min(MAX_PER_LINE, l.qty)) }))
            .filter((l) => PRODUCTS.some((p) => p.slug === l.slug));
          dispatch({ type: "hydrate", lines: sanitized });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so the initial empty state doesn't overwrite a
  // real stored cart.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const addItem = useCallback(
    (slug: string, qty = 1) => {
      dispatch({ type: "add", slug, qty });
      setIsOpen(true);
    },
    [],
  );
  const setQty = useCallback(
    (slug: string, qty: number) => dispatch({ type: "set", slug, qty }),
    [],
  );
  const removeItem = useCallback(
    (slug: string) => dispatch({ type: "remove", slug }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const hydratedLines = useMemo<HydratedLine[]>(() => {
    return lines
      .map((l) => {
        const product = PRODUCTS.find((p) => p.slug === l.slug);
        if (!product) return null;
        const avail = availability(product);
        const cap = avail.kind === "sold-out" ? 0 : avail.remaining;
        return { ...l, qty: Math.min(l.qty, cap || l.qty), product };
      })
      .filter((l): l is HydratedLine => l !== null);
  }, [lines]);

  const itemCount = hydratedLines.reduce((n, l) => n + l.qty, 0);
  const hasUnapprovedPrice = hydratedLines.some((l) => !l.product.priceApproved);

  const value: CartContextValue = {
    lines: hydratedLines,
    itemCount,
    addItem,
    setQty,
    removeItem,
    clear,
    isOpen,
    open,
    close,
    hasUnapprovedPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
