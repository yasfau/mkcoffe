import Link from "next/link";
import { CartBar } from "@/components/cart-bar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-amber-950/10 bg-amber-900 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ☕ MK Coffee
          </Link>
          <Link href="/cart" className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium hover:bg-white/20">
            🛒 Keranjang
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <CartBar />
    </>
  );
}
