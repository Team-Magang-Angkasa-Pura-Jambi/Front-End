import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth-storage")?.value;

  let hasToken = false;

  if (authCookie) {
    try {
      const authState = JSON.parse(authCookie);

      const token = authState?.state?.token || authState?.token;

      if (token) {
        hasToken = true;
      }
    } catch (e) {
      hasToken = false;
    }
  }

  const { pathname } = request.nextUrl;

  const publicPaths = ["/auth/login"];
  const isPublicPath = publicPaths.includes(pathname);

  if (hasToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!hasToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path, KECUALI yang dimulai dengan:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file ikon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
