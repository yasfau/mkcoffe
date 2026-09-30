# ☕ MK Coffee

Aplikasi pemesanan kopi sederhana: pelanggan memesan tanpa login dan menyebutkan lokasi / departemen, pesanan masuk ke **Telegram** barista, dan admin mengelola menu serta status pesanan di `/admin`.

**Stack:** Next.js 16 (App Router) · Tailwind CSS · Drizzle ORM + Supabase (PostgreSQL) · Zustand · Zod

## Menjalankan di komputer

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya (lihat "Setup Supabase")
npm run db:setup             # buat tabel + isi menu contoh di Supabase
npm run dev
```

- Toko: http://localhost:3000
- Admin: http://localhost:3000/admin (password = `ADMIN_PASSWORD` di `.env.local`)

## Environment variable

| Nama | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string Supabase **Transaction pooler** (port 6543), dipakai aplikasi |
| `DIRECT_URL` | Connection string Supabase **Session pooler** (port 5432), dipakai `npm run db:setup` |
| `ADMIN_PASSWORD` | Password untuk masuk ke `/admin`. Mengganti password akan me-logout semua sesi admin |
| `TELEGRAM_BOT_TOKEN` | Token dari @BotFather |
| `TELEGRAM_CHAT_ID` | Tujuan notifikasi (chat pribadi atau grup) |

Kalau variabel Telegram belum diisi, pesanan tetap tersimpan dan hanya notifikasinya yang dilewati.

## Setup Supabase

1. Buat project di https://supabase.com/dashboard. Catat **database password** yang kamu buat.
2. Klik **Connect** (atas halaman project), lalu salin connection string:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Session pooler** (port `5432`) → `DIRECT_URL`

   Ganti `[YOUR-PASSWORD]` dengan database password. Jika password mengandung karakter seperti `@ # / ?`, tulis dalam bentuk URL-encoded (misalnya `@` → `%40`).
3. Buat tabel dengan **salah satu** cara:
   - **Terminal:** `npm run db:setup`
   - **Dashboard:** buka **SQL Editor**, tempel isi [supabase/schema.sql](supabase/schema.sql), lalu klik **Run**.

Skema: `products` (menu), `orders` (pesanan), `order_items` (isi pesanan), dan enum `order_status`. Semua tabel memakai RLS tanpa policy, jadi tidak bisa dibaca lewat Supabase API publik; aplikasi mengakses database langsung dari server.

## Setup Telegram Bot

1. Di Telegram, chat **@BotFather**, kirim `/newbot`, lalu ikuti langkahnya. Simpan **token** yang diberikan.
2. Tentukan tujuan notifikasi:
   - **Chat pribadi:** kirim pesan apa saja ke bot kamu.
   - **Grup barista:** tambahkan bot ke grup, lalu kirim pesan di grup itu.
3. Buka `https://api.telegram.org/bot<TOKEN>/getUpdates` di browser dan cari `"chat":{"id": ...}`. Itulah `TELEGRAM_CHAT_ID` (untuk grup diawali `-`).
4. Isi keduanya di `.env.local`, lalu restart `npm run dev`.

## Fitur

**Pelanggan** (`/`)
- Menu per kategori (hanya menu yang tersedia yang tampil)
- Keranjang tersimpan di browser
- Checkout dengan nama, lokasi / dept, pilihan barista, dan catatan, lalu pesanan dikirim ke Telegram

**Admin** (`/admin`)
- **Pesanan:** daftar pesanan aktif atau semua pesanan, ubah status (Menunggu → Diproses → Siap → Selesai / Dibatalkan), refresh otomatis tiap 15 detik
- **Menu:** tambah, edit, hapus, tandai habis/tersedia, isi URL gambar
- **Barista:** tambah, edit (nama & spesialisasi), hapus, atur Bertugas / Libur

## Struktur

```
src/
├── app/
│   ├── (shop)/            # halaman pelanggan: menu, cart, success
│   └── admin/
│       ├── login/
│       └── (panel)/       # pesanan & kelola menu (wajib login)
├── actions/               # Server Actions: order.ts, admin.ts
├── components/
├── db/                    # schema.ts & koneksi database
├── lib/                   # telegram, sesi admin, format rupiah
├── store/cart.ts          # keranjang (Zustand)
└── proxy.ts               # redirect /admin/* ke login jika belum masuk
```

## Keamanan

- **Harga dihitung di server.** Server selalu mengambil harga dan ketersediaan dari database, bukan dari data yang dikirim browser.
- **Admin dilindungi dua lapis.** Cookie admin bersifat `httpOnly` dan berisi tanda tangan HMAC dari password. `proxy.ts` hanya melakukan redirect; pengecekan yang sesungguhnya ada di setiap halaman dan Server Action admin (`requireAdmin()`).
- **Token Telegram hanya dipakai di server.** Jangan pernah memberi prefix `NEXT_PUBLIC_`.

## Deploy ke Vercel

1. Push kode ke GitHub (repo boleh private).
2. Di https://vercel.com/new, import repo tersebut. Framework otomatis terdeteksi sebagai Next.js.
3. Sebelum klik **Deploy**, buka **Environment Variables** dan isi `DATABASE_URL` (transaction pooler, port 6543), `ADMIN_PASSWORD`, `TELEGRAM_BOT_TOKEN`, dan `TELEGRAM_CHAT_ID`. `DIRECT_URL` tidak perlu.
4. Klik **Deploy**.

`vercel.json` menjalankan server di region Singapura (`sin1`), dekat dengan database Supabase (`ap-southeast-1`), agar query cepat.

Setiap `git push` ke branch utama otomatis men-deploy ulang. Jika mengubah Environment Variables, lakukan **Redeploy** agar nilainya terpakai.

## Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode development |
| `npm run build` / `npm start` | Build & jalankan mode production |
| `npm run db:setup` | Buat/perbarui tabel di Supabase + isi menu contoh (jika kosong) |
| `npm run db:push` | Terapkan perubahan `schema.ts` ke database |
| `npm run db:seed` | Isi menu contoh (jika kosong) |
