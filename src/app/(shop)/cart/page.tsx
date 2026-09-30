import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { CartView } from "@/components/cart-view";
import { db } from "@/db";
import { baristas } from "@/db/schema";

export const metadata = { title: "Keranjang · MK Coffee" };

// Daftar barista selalu terbaru dari database
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const activeBaristas = await db
    .select({ id: baristas.id, name: baristas.name, specialty: baristas.specialty })
    .from(baristas)
    .where(eq(baristas.isActive, true))
    .orderBy(asc(baristas.name));

  return (
    <div>
      <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
        ← Tambah menu lain
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold">Keranjang</h1>
      <CartView baristas={activeBaristas} />
    </div>
  );
}
