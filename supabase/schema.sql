-- =============================================================
-- MK Coffee — skema database untuk Supabase (PostgreSQL)
-- Jalankan sekali di: Supabase Dashboard → SQL Editor → New query → Run
-- (Alternatif dari terminal: npm run db:setup)
-- Database yang sudah ada? Jalankan file di supabase/migrations/ saja.
--
-- Harus sama dengan src/db/schema.ts. Jika mengubah salah satu, ubah juga yang lain.
-- =============================================================

-- Status pesanan
CREATE TYPE public.order_status AS ENUM ('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED');

-- Menu
CREATE TABLE public.products (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  description  text,
  price        integer NOT NULL,                 -- rupiah
  category     text NOT NULL,
  image_url    text,
  is_available boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Barista (dikelola dari /admin/barista)
CREATE TABLE public.baristas (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  specialty  text,                                -- spesialisasi, mis. "Manual brew, latte art"
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pesanan
CREATE TABLE public.orders (
  id            serial PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text,                           -- WhatsApp, format 628xxxxxxxxxx
  location     text NOT NULL,                   -- lokasi / departemen
  barista_id    integer REFERENCES public.baristas (id) ON DELETE SET NULL,
  barista_name  text,                            -- salinan nama; null = barista siapa saja
  note          text,
  total         integer NOT NULL,                -- rupiah
  status        public.order_status NOT NULL DEFAULT 'PENDING',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON public.orders (status);

-- Item per pesanan (nama & harga disalin saat memesan)
CREATE TABLE public.order_items (
  id           serial PRIMARY KEY,
  order_id     integer NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id   integer REFERENCES public.products (id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price        integer NOT NULL,
  quantity     integer NOT NULL
);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);

-- Row Level Security: aktif tanpa policy.
-- Artinya tabel TIDAK bisa diakses lewat Supabase Data API (anon / publishable key).
-- Aplikasi Next.js tetap bisa akses karena terhubung langsung ke Postgres sebagai role postgres.
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baristas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Barista contoh
INSERT INTO public.baristas (name, specialty) VALUES
  ('Rina',  'Latte art, kopi susu'),
  ('Dimas', 'Manual brew (V60, Aeropress)');

-- Menu contoh
INSERT INTO public.products (name, description, price, category) VALUES
  ('Americano',               'Espresso dengan air panas, bold dan clean.',  18000, 'Kopi'),
  ('Caffe Latte',             'Espresso dengan susu steamed yang lembut.',   22000, 'Kopi'),
  ('Cappuccino',              'Espresso, susu, dan foam tebal.',             22000, 'Kopi'),
  ('Kopi Susu Gula Aren',     'Signature: espresso, susu segar, gula aren.', 20000, 'Kopi'),
  ('Matcha Latte',            'Matcha Jepang dengan susu segar.',            24000, 'Non-Kopi'),
  ('Chocolate',               'Cokelat premium, panas atau dingin.',         22000, 'Non-Kopi'),
  ('Croissant',               'Croissant butter renyah.',                    18000, 'Makanan'),
  ('Roti Bakar Cokelat Keju', 'Roti bakar tebal dengan cokelat dan keju.',   20000, 'Makanan');
