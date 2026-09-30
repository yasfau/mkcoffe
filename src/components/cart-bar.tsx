"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { rupiah } from "@/lib/format";
import { cartCount, cartTotal, useCart } from "@/store/cart";

/** Bar keranjang melayang di bawah layar (disembunyikan di halaman keranjang). */
export function CartBar() {
  const items = useCart((s) => s.items);
  const pathname = usePathname();
  const count = cartCount(items);

  if (count === 0 || pathname !== "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-4">
      <Link
        href="/cart"
        className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl bg-amber-900 px-5 py-4 text-white shadow-lg transition hover:bg-amber-950"
      >
        <span className="font-medium">
          🛒 {count} item · {rupiah(cartTotal(items))}
        </span>
        <span className="font-semibold">Lihat Keranjang →</span>
      </Link>
    </div>
  );
}
