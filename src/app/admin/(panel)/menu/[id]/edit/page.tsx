import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/menu";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Edit Menu</h1>
      <ProductForm product={product} categories={await getCategories()} />
    </div>
  );
}
