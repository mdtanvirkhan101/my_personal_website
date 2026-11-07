import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "portfolio_admin_session";
const SECRET_KEY = process.env.AUTH_SECRET || "super-secret-jwt-portfolio-auth-key-change-in-production-12345";
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(COOKIE_NAME)?.value;

    let isAuthenticated = false;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, key, {
          algorithms: ["HS256"],
        });
        if (payload && (payload.role === "ADMIN" || payload.role === "EDITOR")) {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    // Unauthenticated user trying to access protected /admin routes
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated admin trying to access login page
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
