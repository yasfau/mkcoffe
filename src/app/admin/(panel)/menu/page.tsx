import { asc } from "drizzle-orm";
import Link from "next/link";
import { AvailabilityToggle, DeleteProductButton } from "@/components/admin/controls";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdmin();
  const menu = await db.select().from(products).orderBy(asc(products.category), asc(products.name));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950"
        >
          + Tambah Menu
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {menu.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-stone-600">{p.category}</td>
                <td className="px-4 py-3 tabular-nums">{rupiah(p.price)}</td>
                <td className="px-4 py-3">
                  <AvailabilityToggle id={p.id} isAvailable={p.isAvailable} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <Link href={`/admin/menu/${p.id}/edit`} className="text-sm font-medium text-amber-800 hover:underline">
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {menu.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">
                  Belum ada menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-stone-500">Klik status untuk menandai menu habis / tersedia.</p>
    </div>
  );
}
