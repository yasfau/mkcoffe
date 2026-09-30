"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Memuat keranjang dari localStorage setelah halaman tampil di browser. */
export function CartHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
