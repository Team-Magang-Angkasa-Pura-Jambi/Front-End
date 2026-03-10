import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRootPath = pathname === "/";

  const publicPaths = [
    "/auth/login",
    "/auth-required",
    "/forbidden",
    "/not-found",
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  const authCookie = request.cookies.get("auth-storage")?.value;
  let hasToken = false;
  let role = null;

  if (authCookie) {
    try {
      const decodedCookie = decodeURIComponent(authCookie);
      const authState = JSON.parse(decodedCookie);

      const token = authState?.state?.token || authState?.token;
      role = authState?.state?.role || authState?.role;
      hasToken = !!token;
    } catch (_e) {
      hasToken = false;
    }
  }

  if (!hasToken && !isPublicPath) {
    if (isRootPath) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.redirect(new URL("/auth-required", request.url));
  }

  if (hasToken && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasToken && pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua request path kecuali:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - semua file dengan ekstensi (svg, png, jpg, dll)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
