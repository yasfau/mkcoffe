// Mengisi menu contoh jika tabel products masih kosong.
import postgres from "postgres";

process.loadEnvFile?.(".env.local");

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false });

const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM products`;
if (n > 0) {
  console.log("Menu sudah ada, seed dilewati.");
  await sql.end();
  process.exit(0);
}

const menu = [
  ["Americano", "Espresso dengan air panas, bold dan clean.", 18000, "Kopi"],
  ["Caffe Latte", "Espresso dengan susu steamed yang lembut.", 22000, "Kopi"],
  ["Cappuccino", "Espresso, susu, dan foam tebal.", 22000, "Kopi"],
  ["Kopi Susu Gula Aren", "Signature: espresso, susu segar, gula aren.", 20000, "Kopi"],
  ["Matcha Latte", "Matcha Jepang dengan susu segar.", 24000, "Non-Kopi"],
  ["Chocolate", "Cokelat premium, panas atau dingin.", 22000, "Non-Kopi"],
  ["Croissant", "Croissant butter renyah.", 18000, "Makanan"],
  ["Roti Bakar Cokelat Keju", "Roti bakar tebal dengan cokelat dan keju.", 20000, "Makanan"],
];

const rows = menu.map(([name, description, price, category]) => ({ name, description, price, category }));
await sql`INSERT INTO products ${sql(rows, "name", "description", "price", "category")}`;

console.log(`Seed selesai: ${menu.length} menu ditambahkan.`);
await sql.end();
