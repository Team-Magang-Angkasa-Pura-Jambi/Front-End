import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth-storage")?.value;
  const { pathname } = request.nextUrl;

  let token: string | null = null;
  let role: string | null = null;

  if (authCookie) {
    try {
      const authState = JSON.parse(authCookie);
      token = authState?.state?.token ?? null;
      role = authState?.state?.user?.role ?? null;
    } catch {
      token = null;
      role = null;
    }
  }

  const publicPaths = ["/auth/login"];
  const isPublicPath = publicPaths.includes(pathname);

  // 🔴 Belum login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 🔁 Sudah login tapi ke login
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🛡️ ROLE CHECK (INI KUNCI)
  if (token && role) {
    const roleRouteMap: Record<string, string[]> = {
      SuperAdmin: ["/"],
      Admin: ["/", "/data-master", "/budget"],
      Technician: [
        "/",
        "/enter-data",
        "/recap-data",
        "/recap-reading",
        "/profile",
      ],
    };

    const allowedRoutes = roleRouteMap[role] ?? [];

    const isAllowed =
      allowedRoutes.includes("/") ||
      allowedRoutes.some((route) => pathname.startsWith(route));

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}
