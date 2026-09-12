"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./ProductCard";

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  removeItem: (title: string) => void;
  setQty: (title: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function parsePrice(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatINR(value: number): string {
  return `Rs.${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.title === product.title);
      if (found) {
        return prev.map((i) =>
          i.product.title === product.title
            ? { ...i, qty: Math.min(99, i.qty + 1) }
            : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((title: string) => {
    setItems((prev) => prev.filter((i) => i.product.title !== title));
  }, []);

  const setQty = useCallback((title: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.title !== title)
        : prev.map((i) =>
            i.product.title === title
              ? { ...i, qty: Math.min(99, qty) }
              : i
          )
    );
  }, []);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.qty,
        subtotal: acc.subtotal + parsePrice(i.product.price) * i.qty,
      }),
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, addItem, removeItem, setQty }),
    [items, count, subtotal, addItem, removeItem, setQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
