"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { productId: number; name: string; price: number; quantity: number };
export type CurrentProduct = { id: number; name: string; price: number };
export type SyncResult = { changed: string[]; removed: string[] };

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  /** Samakan nama & harga dengan data terbaru dari server; item yang tidak ada di `current` dihapus. */
  sync: (current: CurrentProduct[]) => SyncResult;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, ...item, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: 1 }] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      clear: () => set({ items: [] }),
      sync: (current) => {
        const result: SyncResult = { changed: [], removed: [] };
        let dirty = false;
        const items: CartItem[] = [];
        for (const item of get().items) {
          const p = current.find((c) => c.id === item.productId);
          if (!p) {
            result.removed.push(item.name);
            dirty = true;
            continue;
          }
          if (p.price !== item.price) result.changed.push(p.name);
          if (p.price !== item.price || p.name !== item.name) dirty = true;
          items.push({ ...item, name: p.name, price: p.price });
        }
        if (dirty) set({ items });
        return result;
      },
    }),
    // skipHydration: dibaca dari localStorage setelah mount (lihat CartHydrator) agar tidak hydration mismatch
    { name: "mkcoffe-cart", skipHydration: true }
  )
);

/** true setelah keranjang selesai dimuat dari localStorage. */
export function useCartHydrated() {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false
  );
}

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
