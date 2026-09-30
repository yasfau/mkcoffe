import Link from "next/link";
import { logout } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin · MK Coffee" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <span className="font-bold">☕ Admin</span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/admin" className="text-stone-700 hover:text-amber-800">
              Pesanan
            </Link>
            <Link href="/admin/menu" className="text-stone-700 hover:text-amber-800">
              Menu
            </Link>
            <Link href="/admin/barista" className="text-stone-700 hover:text-amber-800">
              Barista
            </Link>
            <Link href="/" target="_blank" className="text-stone-700 hover:text-amber-800">
              Lihat Toko ↗
            </Link>
          </nav>
          <form action={logout} className="ml-auto">
            <button className="text-sm text-stone-500 hover:text-red-600">Keluar</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
