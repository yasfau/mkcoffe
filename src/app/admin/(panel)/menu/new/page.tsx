import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/menu";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Tambah Menu</h1>
      <ProductForm categories={await getCategories()} />
    </div>
  );
}
