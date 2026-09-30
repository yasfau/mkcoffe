import { asc } from "drizzle-orm";
import Link from "next/link";
import { BaristaActiveToggle, DeleteBaristaButton } from "@/components/admin/controls";
import { db } from "@/db";
import { baristas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBaristaPage() {
  await requireAdmin();
  const list = await db.select().from(baristas).orderBy(asc(baristas.name));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Barista</h1>
        <Link
          href="/admin/barista/new"
          className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950"
        >
          + Tambah Barista
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Spesialisasi</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {list.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-stone-600">{b.specialty ?? "—"}</td>
                <td className="px-4 py-3">
                  <BaristaActiveToggle id={b.id} isActive={b.isActive} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/barista/${b.id}/edit`}
                      className="text-sm font-medium text-amber-800 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteBaristaButton id={b.id} name={b.name} />
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                  Belum ada barista. Pelanggan tidak akan melihat pilihan barista sampai ada yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-stone-500">
        Klik status untuk mengubah Bertugas / Libur. Barista yang libur tidak muncul di pilihan pelanggan.
      </p>
    </div>
  );
}
