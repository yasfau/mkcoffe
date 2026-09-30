"use client";

import { useCart } from "@/store/cart";

type Props = { productId: number; name: string; price: number };

export function AddToCartButton({ productId, name, price }: Props) {
  const quantity = useCart((s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0);
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);

  if (quantity === 0) {
    return (
      <button
        onClick={() => add({ productId, name, price })}
        className="rounded-full bg-amber-800 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-900"
      >
        + Tambah
      </button>
    );
  }

  return <QuantityStepper value={quantity} onChange={(q) => setQuantity(productId, q)} />;
}

export function QuantityStepper({ value, onChange }: { value: number; onChange: (q: number) => void }) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-amber-800 text-amber-900 font-bold transition hover:bg-amber-50";
  return (
    <div className="flex items-center gap-3">
      <button aria-label="Kurangi" className={btn} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="w-5 text-center font-semibold tabular-nums">{value}</span>
      <button aria-label="Tambah" className={btn} onClick={() => onChange(Math.min(value + 1, 20))}>
        +
      </button>
    </div>
  );
}
