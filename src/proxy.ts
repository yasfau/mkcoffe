import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-session";

// Pemeriksaan cepat: arahkan ke /admin/login jika belum login.
// Pemeriksaan sesungguhnya tetap dilakukan di setiap halaman & Server Action admin (requireAdmin).
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  if (!(await isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
