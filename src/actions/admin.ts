"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { baristas, orders, products } from "@/db/schema";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-session";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/order-status";

export type FormState = { error?: string } | undefined;

// ---------- Login ----------

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD belum diisi di .env.local" };
  if (password !== process.env.ADMIN_PASSWORD) return { error: "Password salah" };

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, await createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------- Menu ----------

const productSchema = z.object({
  name: z.string().trim().min(1, "Nama menu wajib diisi").max(80),
  description: z.string().trim().max(300).optional(),
  price: z.coerce.number().int("Harga harus angka bulat").min(0, "Harga tidak boleh minus"),
  category: z.string().trim().min(1, "Kategori wajib diisi").max(40),
  imageUrl: z.union([z.literal(""), z.url("URL gambar tidak valid")]),
  isAvailable: z.boolean(),
});

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || "",
    isAvailable: formData.get("isAvailable") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const values = {
    ...parsed.data,
    description: parsed.data.description || null,
    imageUrl: parsed.data.imageUrl || null,
  };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    await db.insert(products).values(values);
  }

  revalidatePath("/");
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function toggleAvailability(id: number, isAvailable: boolean) {
  await requireAdmin();
  await db.update(products).set({ isAvailable }).where(eq(products.id, id));
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

// ---------- Pesanan ----------

export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin();
  const s = z.enum(ORDER_STATUSES).parse(status);
  await db.update(orders).set({ status: s }).where(eq(orders.id, id));
  revalidatePath("/admin");
}

// ---------- Barista ----------

const baristaSchema = z.object({
  name: z.string().trim().min(1, "Nama barista wajib diisi").max(50),
  specialty: z.string().trim().max(120).optional(),
  isActive: z.boolean(),
});

export async function saveBarista(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = baristaSchema.safeParse({
    name: formData.get("name"),
    specialty: formData.get("specialty") || undefined,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const values = { ...parsed.data, specialty: parsed.data.specialty || null };

  const id = Number(formData.get("id"));
  if (id) {
    await db.update(baristas).set(values).where(eq(baristas.id, id));
  } else {
    await db.insert(baristas).values(values);
  }

  revalidatePath("/cart");
  revalidatePath("/admin/barista");
  redirect("/admin/barista");
}

export async function toggleBaristaActive(id: number, isActive: boolean) {
  await requireAdmin();
  await db.update(baristas).set({ isActive }).where(eq(baristas.id, id));
  revalidatePath("/cart");
  revalidatePath("/admin/barista");
}

export async function deleteBarista(id: number) {
  await requireAdmin();
  // Pesanan lama tetap menyimpan nama barista (barista_name); barista_id otomatis jadi null
  await db.delete(baristas).where(eq(baristas.id, id));
  revalidatePath("/cart");
  revalidatePath("/admin/barista");
}
