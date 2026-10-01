"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { baristas, orderItems, orders, products } from "@/db/schema";
import { rupiah } from "@/lib/format";
import { formatPhone, normalizePhone, waLink } from "@/lib/phone";
import { escapeHtml, sendTelegram } from "@/lib/telegram";

const orderSchema = z.object({
  customerName: z.string().trim().min(1, "Nama wajib diisi").max(50),
  customerPhone: z
    .string()
    .transform((s, ctx) => {
      const phone = normalizePhone(s);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890" });
        return z.NEVER;
      }
      return phone;
    }),
  location: z.string().trim().min(1, "Lokasi / Dept wajib diisi").max(50),
  baristaId: z.number().int().nullable(), // null = barista siapa saja
  note: z.string().trim().max(200).optional(),
  items: z
    .array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Keranjang masih kosong")
    .max(30),
  // Total yang dilihat pelanggan; ditolak jika berbeda dengan harga terbaru di database
  expectedTotal: z.number().int(),
});

export type CreateOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string; priceChanged?: boolean };

/** Harga & nama terbaru untuk menu yang masih tersedia (dipakai untuk menyinkronkan keranjang). */
export async function getAvailableProducts(ids: number[]) {
  const parsed = z.array(z.number().int()).max(50).safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return [];
  return db
    .select({ id: products.id, name: products.name, price: products.price })
    .from(products)
    .where(and(inArray(products.id, parsed.data), eq(products.isAvailable, true)));
}

export async function createOrder(input: z.input<typeof orderSchema>): Promise<CreateOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  // Harga & ketersediaan selalu diambil dari database, bukan dari client
  const found = await db
    .select()
    .from(products)
    .where(inArray(products.id, data.items.map((i) => i.productId)));

  const lines = [];
  for (const item of data.items) {
    const p = found.find((f) => f.id === item.productId);
    if (!p || !p.isAvailable) {
      return {
        ok: false,
        error: `Maaf, "${p?.name ?? "salah satu menu"}" sedang tidak tersedia. Hapus dari keranjang dulu.`,
      };
    }
    lines.push({ productId: p.id, productName: p.name, price: p.price, quantity: item.quantity });
  }
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  if (total !== data.expectedTotal) {
    return {
      ok: false,
      priceChanged: true,
      error: `Harga menu baru saja berubah. Total terbaru ${rupiah(total)}, silakan cek lagi lalu pesan ulang.`,
    };
  }

  let barista: { id: number; name: string } | null = null;
  if (data.baristaId !== null) {
    [barista] = await db
      .select({ id: baristas.id, name: baristas.name })
      .from(baristas)
      .where(and(eq(baristas.id, data.baristaId), eq(baristas.isActive, true)));
    if (!barista) return { ok: false, error: "Barista yang dipilih sedang tidak bertugas. Silakan pilih yang lain." };
  }

  const [order] = await db
    .insert(orders)
    .values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      location: data.location,
      baristaId: barista?.id ?? null,
      baristaName: barista?.name ?? null,
      note: data.note || null,
      total,
    })
    .returning();
  await db.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));

  const text = [
    `☕ <b>PESANAN BARU #${order.id}</b>`,
    `👤 ${escapeHtml(data.customerName)}`,
    `📱 <a href="${waLink(data.customerPhone)}">${formatPhone(data.customerPhone)}</a>`,
    `📍 ${escapeHtml(data.location)}`,
    `🧑‍🍳 Barista: ${barista ? escapeHtml(barista.name) : "siapa saja"}`,
    ``,
    ...lines.map((l) => `• ${l.quantity}x ${escapeHtml(l.productName)} — ${rupiah(l.price * l.quantity)}`),
    ``,
    `<b>Total: ${rupiah(total)}</b>`,
    data.note ? `📝 ${escapeHtml(data.note)}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  // Pesanan sudah tersimpan; kegagalan Telegram tidak membatalkan pesanan
  try {
    await sendTelegram(text);
  } catch (err) {
    console.error("[telegram] gagal kirim notifikasi:", err);
  }

  revalidatePath("/admin");
  return { ok: true, orderId: order.id };
}
