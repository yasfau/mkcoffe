import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL belum diisi. Lokal: isi di .env.local. Vercel: Settings → Environment Variables, lalu Redeploy."
  );
}

// Satu koneksi dipakai ulang saat hot-reload di development,
// tapi dibuat ulang jika DATABASE_URL berubah
const globalForDb = globalThis as unknown as { pg?: { url: string; client: ReturnType<typeof postgres> } };

if (globalForDb.pg && globalForDb.pg.url !== url) {
  void globalForDb.pg.client.end({ timeout: 5 });
  globalForDb.pg = undefined;
}

// prepare: false wajib untuk Supabase transaction pooler (port 6543)
const client = globalForDb.pg?.client ?? postgres(url, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.pg = { url, client };

export const db = drizzle({ client, schema });
