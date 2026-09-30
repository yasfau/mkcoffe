import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan membuka dev server lewat IP jaringan lokal (mis. dari HP: http://192.168.x.x:3000).
  // Tanpa ini Next.js memblokir JavaScript dev sehingga tombol tidak bisa diklik.
  // Hanya berlaku untuk `npm run dev`, tidak berpengaruh ke production.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
