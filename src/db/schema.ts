import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { ORDER_STATUSES } from "../lib/order-status";

// RLS diaktifkan tanpa policy: tabel tertutup dari Supabase Data API (anon key),
// sementara aplikasi tetap bisa akses karena terhubung langsung sebagai role postgres.

export const orderStatus = pgEnum("order_status", ORDER_STATUSES);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // rupiah
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const baristas = pgTable("baristas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty"), // spesialisasi, mis. "Manual brew, latte art"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"), // WhatsApp, format 628xxx (null untuk pesanan lama)
    location: text("location").notNull(), // lokasi / departemen
    baristaId: integer("barista_id").references(() => baristas.id, { onDelete: "set null" }),
    baristaName: text("barista_name"), // snapshot; null = barista siapa saja
    note: text("note"),
    total: integer("total").notNull(),
    status: orderStatus("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_status_idx").on(t.status)]
).enableRLS();

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(), // snapshot, tetap ada walau menu dihapus
    price: integer("price").notNull(), // snapshot harga saat dipesan
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)]
).enableRLS();

export type Product = typeof products.$inferSelect;
export type Barista = typeof baristas.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
