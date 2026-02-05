import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ================= SAFE PATH =================
  const publicPaths = [
    "/auth/login",
    "/auth-required",
    "/forbidden",
    "/not-found",
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // ================= AUTH CHECK =================
  const authCookie = request.cookies.get("auth-storage")?.value;

  let token: string | null = null;
  let role: string | null = null;

  if (authCookie) {
    try {
      const authState = JSON.parse(authCookie);
      token = authState?.state?.token || authState?.token || null;
      role = authState?.state?.role || authState?.role || null;
    } catch {
      token = null;
      role = null;
    }
  }

  const hasToken = Boolean(token);

  // ================= RULES =================

  // 🔐 BELUM LOGIN → AUTH REQUIRED (401)
  if (!hasToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth-required", request.url));
  }

  // 🔁 SUDAH LOGIN TAPI BUKA LOGIN PAGE
  if (hasToken && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🚫 ROLE CHECK (403)
  if (hasToken && pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
