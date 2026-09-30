"use client";

import { useEffect } from "react";
import { useCart, useCartHydrated, type CurrentProduct } from "@/store/cart";

/** Menyamakan harga di keranjang dengan menu yang sedang tampil (menu habis ikut dihapus dari keranjang). */
export function CartSync({ products }: { products: CurrentProduct[] }) {
  const hydrated = useCartHydrated();
  useEffect(() => {
    if (hydrated) useCart.getState().sync(products);
  }, [hydrated, products]);
  return null;
}
