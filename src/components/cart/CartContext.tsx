"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productSlug: string, sizeName: string, quantity: number) => void;
  removeItem: (productSlug: string, sizeName: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ivoryhomez-cart-v1";

type CartState = { items: CartItem[]; hydrated: boolean };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ items: [], hydrated: false });
  const [isOpen, setIsOpen] = useState(false);
  const { items, hydrated } = cart;

  const setItems = useCallback((update: (prev: CartItem[]) => CartItem[]) => {
    setCart((prev) => ({ ...prev, items: update(prev.items) }));
  }, []);

  useEffect(() => {
    let stored: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // corrupted storage — start fresh
    }
    // The cart must render empty on the server, so localStorage can only be
    // merged in after hydration — a one-time sync from an external store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart({ items: stored, hydrated: true });
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productSlug === item.productSlug && i.sizeName === item.sizeName
        );
        if (existing) {
          return prev.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (productSlug: string, sizeName: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !(i.productSlug === productSlug && i.sizeName === sizeName))
          : prev.map((i) =>
              i.productSlug === productSlug && i.sizeName === sizeName
                ? { ...i, quantity }
                : i
            )
      );
    },
    [setItems]
  );

  const removeItem = useCallback(
    (productSlug: string, sizeName: string) => {
      setItems((prev) =>
        prev.filter((i) => !(i.productSlug === productSlug && i.sizeName === sizeName))
      );
    },
    [setItems]
  );

  const clearCart = useCallback(() => setItems(() => []), [setItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.unitPrice * i.quantity, 0),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, isOpen, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
