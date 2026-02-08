import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logServerEvent } from "@/lib/observability/server-logger";

const AUTH_COOKIE = "access_token";

const isPublicPath = (pathname: string) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/robots.txt");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    if (token) {
      logServerEvent("info", "auth_redirect", "Redirected authenticated user", {
        pathname,
      });
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    logServerEvent("info", "auth_redirect", "Redirected unauthenticated user", {
      pathname,
    });
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/login";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
