"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveBarista } from "@/actions/admin";
import type { Barista } from "@/db/schema";

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

export function BaristaForm({ barista }: { barista?: Barista }) {
  const [state, action, pending] = useActionState(saveBarista, undefined);

  return (
    <form action={action} className="max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      {barista && <input type="hidden" name="id" value={barista.id} />}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">Nama barista</span>
        <input name="name" required maxLength={50} defaultValue={barista?.name} className={input} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">Spesialisasi (opsional)</span>
        <input
          name="specialty"
          maxLength={120}
          defaultValue={barista?.specialty ?? ""}
          placeholder="Contoh: Latte art, manual brew V60"
          className={input}
        />
        <span className="mt-1 block text-xs text-stone-500">Ditampilkan ke pelanggan saat memilih barista.</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={barista?.isActive ?? true}
          className="h-4 w-4 accent-amber-800"
        />
        <span className="text-sm font-medium">Bertugas (bisa dipilih pelanggan)</span>
      </label>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-3">
        <button
          disabled={pending}
          className="rounded-lg bg-amber-900 px-5 py-2 font-semibold text-white hover:bg-amber-950 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        <Link href="/admin/barista" className="rounded-lg px-5 py-2 font-medium text-stone-600 hover:bg-stone-100">
          Batal
        </Link>
      </div>
    </form>
  );
}
