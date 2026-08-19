import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "SUPER_ADMIN" | "ADMIN" | "TECHNICIAN";

// ─── Route → Allowed Roles mapping ────────────────────────────
// Routes not listed here are accessible by ANY authenticated user.
const PROTECTED_ROUTES: { prefix: string; roles: Role[] }[] = [
  // SUPER_ADMIN only
  { prefix: "/dashboard-config", roles: ["SUPER_ADMIN"] },
  { prefix: "/system-config", roles: ["SUPER_ADMIN"] },
  { prefix: "/server-monitoring", roles: ["SUPER_ADMIN"] },
  { prefix: "/audit-logs", roles: ["SUPER_ADMIN"] },
  { prefix: "/user-management", roles: ["SUPER_ADMIN"] },
  { prefix: "/bug-reports", roles: ["SUPER_ADMIN"] },

  // SUPER_ADMIN + ADMIN
  { prefix: "/data-master", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/calculation-templates", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/budget", roles: ["SUPER_ADMIN", "ADMIN"] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRootPath = pathname === "/";
  const prefixPublicPaths = ["/auth", "/auth-required", "/403", "/not-found"];
  const isPublicPath =
    isRootPath ||
    prefixPublicPaths.some((path) => pathname.startsWith(path));

  // ── Parse auth cookie ──────────────────────────────────────
  const authCookie = request.cookies.get("auth-storage")?.value;

  let token: string | null = null;
  let role: Role | null = null;

  if (authCookie) {
    try {
      const authState = JSON.parse(authCookie);
      // Zustand persist stores data under `state`
      token = authState?.state?.token ?? authState?.token ?? null;
      role =
        authState?.state?.user?.role ??
        authState?.user?.role ??
        null;
    } catch {
      token = null;
      role = null;
    }
  }

  const hasToken = Boolean(token);

  // ── 1. Not authenticated → redirect to auth-required ──────
  if (!hasToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth-required", request.url));
  }

  // ── 2. Already authenticated → redirect away from auth pages
  if (hasToken && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 3. Role-based route protection ────────────────────────
  if (hasToken && role) {
    const matchedRoute = PROTECTED_ROUTES.find((route) =>
      pathname.startsWith(route.prefix)
    );

    if (matchedRoute && !matchedRoute.roles.includes(role)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)", "/"],
};
