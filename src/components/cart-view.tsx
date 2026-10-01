"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createOrder, getAvailableProducts } from "@/actions/order";
import { QuantityStepper } from "@/components/add-to-cart-button";
import { rupiah } from "@/lib/format";
import { cartTotal, useCart, useCartHydrated } from "@/store/cart";

const input =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

/**
 * Ambil harga terbaru dari database agar nominal di keranjang selalu sesuai menu saat ini.
 * Mengembalikan pesan pemberitahuan jika ada harga berubah / menu dihapus.
 */
async function syncPrices(): Promise<string | null> {
  const ids = useCart.getState().items.map((i) => i.productId);
  const result = useCart.getState().sync(await getAvailableProducts(ids));
  const messages = [];
  if (result.changed.length) messages.push(`Harga ${result.changed.join(", ")} sudah diperbarui.`);
  if (result.removed.length) messages.push(`${result.removed.join(", ")} dihapus karena sedang tidak tersedia.`);
  return messages.length ? messages.join(" ") : null;
}

/** Data pemesan diingat di browser agar tidak perlu diketik ulang di pesanan berikutnya. */
type SavedCustomer = { customerName: string; customerPhone: string; location: string };
const CUSTOMER_KEY = "mkcoffe-customer";

function loadCustomer(): SavedCustomer | null {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "null");
  } catch {
    return null;
  }
}

function saveCustomer(customer: SavedCustomer) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  } catch {
    // localStorage tidak tersedia (mode privat, dsb.) — abaikan
  }
}

export type BaristaOption ={ id: number; name: string; specialty: string | null };

export function CartView({ baristas }: { baristas: BaristaOption[] }) {
  const { items, setQuantity, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [baristaId, setBaristaId] = useState(""); // "" = siapa saja
  // Form baru dirender setelah hydrated (di browser), jadi aman membaca localStorage di sini
  const [savedCustomer] = useState(loadCustomer);
  const hydrated = useCartHydrated();
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    syncPrices()
      .then(setNotice, () => setNotice("Gagal memuat harga terbaru. Coba muat ulang halaman."))
      .finally(() => setSyncing(false));
  }, [hydrated]);

  if (!hydrated || submitted) {
    return <p className="py-10 text-center text-stone-500">{submitted ? "Pesanan terkirim, mengalihkan..." : "Memuat..."}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 text-stone-600">Keranjang masih kosong.</p>
        <Link href="/" className="mt-5 inline-block font-semibold text-amber-800 hover:underline">
          ← Lihat menu
        </Link>
      </div>
    );
  }

  // onSubmit (bukan form action) agar isian tidak dikosongkan React saat pesanan ditolak
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customer: SavedCustomer = {
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      location: String(formData.get("location") ?? ""),
    };
    setError(null);
    startTransition(async () => {
      const result = await createOrder({
        ...customer,
        baristaId: formData.get("baristaId") ? Number(formData.get("baristaId")) : null,
        note: String(formData.get("note") ?? "") || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        expectedTotal: cartTotal(items),
      });
      if (!result.ok) {
        if (result.priceChanged) setNotice(await syncPrices());
        setError(result.error);
        return;
      }
      saveCustomer(customer);
      setSubmitted(true);
      clear();
      router.push(`/success?id=${result.orderId}`);
    });
  }

  return (
    <div className="space-y-6">
      {notice && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">ℹ️ {notice}</p>}
      <ul className="divide-y divide-stone-100 rounded-2xl bg-white shadow-sm">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-stone-500">{rupiah(item.price)}</p>
            </div>
            <div className="flex items-center gap-4">
              <QuantityStepper value={item.quantity} onChange={(q) => setQuantity(item.productId, q)} />
              <p className="w-24 text-right font-semibold tabular-nums">{rupiah(item.price * item.quantity)}</p>
            </div>
          </li>
        ))}
        <li className="flex justify-between p-4 text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">{rupiah(cartTotal(items))}</span>
        </li>
      </ul>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Data Pemesan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Nama</span>
            <input
              name="customerName"
              required
              maxLength={50}
              defaultValue={savedCustomer?.customerName}
              className={input}
              placeholder="Nama kamu"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Lokasi / Dept</span>
            <input
              name="location"
              required
              maxLength={50}
              defaultValue={savedCustomer?.location}
              className={input}
              placeholder="Contoh: Keuangan lt. 2"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">No. WhatsApp</span>
          <input
            name="customerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            defaultValue={savedCustomer?.customerPhone}
            className={input}
            placeholder="0812 3456 7890"
          />
          <span className="mt-1 block text-xs text-stone-500">Kami kabari lewat WhatsApp saat pesananmu siap diambil.</span>
        </label>
        {baristas.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">Pilih Barista</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <BaristaCard
                value=""
                name="Siapa saja"
                specialty="Barista yang sedang senggang"
                selected={baristaId}
                onSelect={setBaristaId}
              />
              {baristas.map((b) => (
                <BaristaCard
                  key={b.id}
                  value={String(b.id)}
                  name={b.name}
                  specialty={b.specialty}
                  selected={baristaId}
                  onSelect={setBaristaId}
                />
              ))}
            </div>
          </fieldset>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Catatan (opsional)</span>
          <textarea
            name="note"
            maxLength={200}
            rows={2}
            className={input}
            placeholder="Contoh: latte less sugar, es sedikit"
          />
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={pending || syncing}
          className="w-full rounded-xl bg-amber-900 py-3.5 font-semibold text-white transition hover:bg-amber-950 disabled:opacity-60"
        >
          {pending ? "Mengirim pesanan..." : syncing ? "Memeriksa harga..." : `Pesan Sekarang · ${rupiah(cartTotal(items))}`}
        </button>
      </form>
    </div>
  );
}

function BaristaCard(props: {
  value: string;
  name: string;
  specialty: string | null;
  selected: string;
  onSelect: (value: string) => void;
}) {
  const checked = props.selected === props.value;
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
        checked ? "border-amber-800 bg-amber-50 ring-2 ring-amber-800/20" : "border-stone-300 hover:border-amber-700"
      }`}
    >
      <input
        type="radio"
        name="baristaId"
        value={props.value}
        checked={checked}
        onChange={() => props.onSelect(props.value)}
        className="mt-1 accent-amber-800"
      />
      <span>
        <span className="block font-medium">{props.name}</span>
        {props.specialty && <span className="block text-sm text-stone-500">{props.specialty}</span>}
      </span>
    </label>
  );
}
