"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProduct } from "@/actions/admin";
import type { Product } from "@/db/schema";

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

export function ProductForm({ product, categories }: { product?: Product; categories: string[] }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);

  return (
    <form action={action} className="max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Field label="Nama menu">
        <input name="name" required defaultValue={product?.name} className={input} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Harga (Rp)">
          <input name="price" type="number" min={0} step={500} required defaultValue={product?.price} className={input} />
        </Field>
        <Field label="Kategori">
          <input
            name="category"
            required
            list="categories"
            defaultValue={product?.category}
            placeholder="Kopi, Non-Kopi, Makanan..."
            className={input}
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Deskripsi (opsional)">
        <textarea name="description" rows={2} defaultValue={product?.description ?? ""} className={input} />
      </Field>

      <Field label="URL gambar (opsional)">
        <input
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl ?? ""}
          placeholder="https://..."
          className={input}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={product?.isAvailable ?? true}
          className="h-4 w-4 accent-amber-800"
        />
        <span className="text-sm font-medium">Tersedia (tampil & bisa dipesan)</span>
      </label>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-3">
        <button
          disabled={pending}
          className="rounded-lg bg-amber-900 px-5 py-2 font-semibold text-white hover:bg-amber-950 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        <Link href="/admin/menu" className="rounded-lg px-5 py-2 font-medium text-stone-600 hover:bg-stone-100">
          Batal
        </Link>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}
