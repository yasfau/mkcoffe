"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  deleteBarista,
  deleteProduct,
  toggleAvailability,
  toggleBaristaActive,
  updateOrderStatus,
} from "@/actions/admin";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/order-status";

export function AvailabilityToggle({ id, isAvailable }: { id: number; isAvailable: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleAvailability(id, !isAvailable))}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        isAvailable ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
      }`}
    >
      {isAvailable ? "Tersedia" : "Habis"}
    </button>
  );
}

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus menu "${name}"?`)) startTransition(() => deleteProduct(id));
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Hapus
    </button>
  );
}

export function BaristaActiveToggle({ id, isActive }: { id: number; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleBaristaActive(id, !isActive))}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${
        isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
      }`}
    >
      {isActive ? "Bertugas" : "Libur"}
    </button>
  );
}

export function DeleteBaristaButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus barista "${name}"? Riwayat pesanan tetap menyimpan namanya.`))
          startTransition(() => deleteBarista(id));
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Hapus
    </button>
  );
}

export function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => updateOrderStatus(id, next));
      }}
      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

/** Memuat ulang data halaman secara berkala agar pesanan baru muncul otomatis. */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
