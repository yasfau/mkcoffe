// Token sesi admin = HMAC(ADMIN_PASSWORD). Cookie tidak bisa dipalsukan tanpa tahu password,
// dan mengganti password otomatis me-logout semua sesi. Memakai Web Crypto agar jalan di proxy.
export const ADMIN_COOKIE = "mkcoffe_admin";

export async function createAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD belum diisi di .env.local");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("mkcoffe-admin-session"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  return token === (await createAdminToken());
}
