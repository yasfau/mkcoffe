import { BaristaForm } from "@/components/admin/barista-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewBaristaPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Tambah Barista</h1>
      <BaristaForm />
    </div>
  );
}
