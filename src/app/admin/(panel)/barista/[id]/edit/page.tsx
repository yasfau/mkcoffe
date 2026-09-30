import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BaristaForm } from "@/components/admin/barista-form";
import { db } from "@/db";
import { baristas } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function EditBaristaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [barista] = await db
    .select()
    .from(baristas)
    .where(eq(baristas.id, Number(id)));
  if (!barista) notFound();

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Edit Barista</h1>
      <BaristaForm barista={barista} />
    </div>
  );
}
