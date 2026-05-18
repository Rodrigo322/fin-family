import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/constants";

const protectedRoutes = [
  "/dashboard",
  "/expenses",
  "/incomes",
  "/credit-cards",
  "/invoices",
  "/bills",
  "/upcoming",
  "/categories",
  "/family",
  "/reports",
  "/settings",
];

export function proxy(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/incomes/:path*",
    "/credit-cards/:path*",
    "/invoices/:path*",
    "/bills/:path*",
    "/upcoming/:path*",
    "/categories/:path*",
    "/family/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
