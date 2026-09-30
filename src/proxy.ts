import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

// Gate every /admin route behind the admin session cookie. The login page
// itself stays reachable. This only checks that the cookie is a genuine,
// unexpired session — whether its owner is still on the admin list needs the
// database, and is checked where the data is read and in every admin server
// action (see src/lib/admin/auth.ts). This redirect is UX, not the only lock.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (pathname !== "/admin") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
