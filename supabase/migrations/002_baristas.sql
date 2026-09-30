-- =============================================================
-- MK Coffee — migrasi 002: fitur pilih barista
-- Jalankan sekali di: Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan ulang (IF NOT EXISTS).
-- =============================================================

-- Daftar barista (dikelola dari /admin/barista)
CREATE TABLE IF NOT EXISTS public.baristas (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  specialty  text,                                -- spesialisasi, mis. "Manual brew, latte art"
  is_active  boolean NOT NULL DEFAULT true,       -- false = tidak tampil di pilihan pelanggan
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baristas ENABLE ROW LEVEL SECURITY;

-- Barista yang dipilih pada pesanan (null = siapa saja)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS barista_id   integer REFERENCES public.baristas (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS barista_name text;   -- salinan nama, tetap ada walau barista dihapus

-- Barista contoh (hanya jika tabel masih kosong) — silakan ubah dari halaman admin
INSERT INTO public.baristas (name, specialty)
SELECT * FROM (VALUES
  ('Rina', 'Latte art, kopi susu'),
  ('Dimas', 'Manual brew (V60, Aeropress)')
) AS v(name, specialty)
WHERE NOT EXISTS (SELECT 1 FROM public.baristas);
