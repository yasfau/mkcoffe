import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

/** Daftar kategori yang sudah dipakai, untuk saran di form menu. */
export async function getCategories() {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .orderBy(asc(products.category));
  return rows.map((r) => r.category);
}
