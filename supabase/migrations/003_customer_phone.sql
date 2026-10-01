-- =============================================================
-- MK Coffee — migrasi 003: nomor WhatsApp pemesan
-- Jalankan sekali di: Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan ulang (IF NOT EXISTS). Pesanan lama tetap ada (kolomnya kosong).
-- =============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone text;   -- format 628xxxxxxxxxx
