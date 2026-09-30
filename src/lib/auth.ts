import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidAdminToken } from "./admin-session";

export async function isAdmin() {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

/** Dipanggil di setiap halaman & Server Action admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
