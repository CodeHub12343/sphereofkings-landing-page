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
  | { type: "replace"; lines: CartLine[] }
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
    case "replace":
      // Dedupe by slug + cap per line, in case a caller passes a noisy list.
      return action.lines
        .filter((l) => typeof l.slug === "string" && l.qty > 0)
        .reduce<CartLine[]>((acc, l) => {
          const existing = acc.find((x) => x.slug === l.slug);
          if (existing) {
            existing.qty = Math.min(MAX_PER_LINE, existing.qty + l.qty);
          } else {
            acc.push({ slug: l.slug, qty: Math.min(MAX_PER_LINE, l.qty) });
          }
          return acc;
        }, []);
    default:
      return state;
  }
}

type Toast = { id: number; message: string } | null;

type CartContextValue = {
  lines: HydratedLine[];
  itemCount: number;
  addItem: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  // Replace the whole cart with the given lines. Used by the one-click
  // wholesale checkout to seed the cart from an approved quote.
  replaceCart: (lines: CartLine[]) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  hasUnapprovedPrice: boolean;
  toast: Toast;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reduce, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

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
      const product = PRODUCTS.find((p) => p.slug === slug);
      const label = product?.name ?? "Item";
      setToast({ id: Date.now(), message: `${label} added to cart` });
    },
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  // Auto-dismiss toast after a short beat so the user has time to read.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  const setQty = useCallback(
    (slug: string, qty: number) => dispatch({ type: "set", slug, qty }),
    [],
  );
  const removeItem = useCallback(
    (slug: string) => dispatch({ type: "remove", slug }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const replaceCart = useCallback(
    (next: CartLine[]) => dispatch({ type: "replace", lines: next }),
    [],
  );
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
    replaceCart,
    isOpen,
    open,
    close,
    hasUnapprovedPrice,
    toast,
    dismissToast,
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
