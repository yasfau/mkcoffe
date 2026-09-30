import { asc, eq } from "drizzle-orm";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CartSync } from "@/components/cart-sync";
import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { rupiah } from "@/lib/format";

// Selalu ambil menu terbaru dari database
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menu = await db
    .select()
    .from(products)
    .where(eq(products.isAvailable, true))
    .orderBy(asc(products.category), asc(products.name));

  const byCategory = Map.groupBy(menu, (p) => p.category);

  if (menu.length === 0) {
    return <p className="py-20 text-center text-stone-500">Menu belum tersedia.</p>;
  }

  return (
    <div className="space-y-8">
      <CartSync products={menu.map((p) => ({ id: p.id, name: p.name, price: p.price }))} />
      {[...byCategory].map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-3 text-lg font-bold text-amber-950">{category}</h2>
          <ul className="space-y-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <li className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
      {p.imageUrl ? (
        <img src={p.imageUrl} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-3xl">
          {p.category.toLowerCase().includes("makan") ? "🥐" : "☕"}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold">{p.name}</h3>
          {p.description && <p className="line-clamp-2 text-sm text-stone-500">{p.description}</p>}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-amber-900">{rupiah(p.price)}</span>
          <AddToCartButton productId={p.id} name={p.name} price={p.price} />
        </div>
      </div>
    </li>
  );
}
