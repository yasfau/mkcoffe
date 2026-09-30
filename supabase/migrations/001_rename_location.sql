-- =============================================================
-- MK Coffee — migrasi 001: "No. Meja" menjadi "Lokasi / Dept"
-- (Sudah dijalankan di project yasfau. Simpan untuk database lain.)
-- =============================================================
ALTER TABLE public.orders RENAME COLUMN table_number TO location;
