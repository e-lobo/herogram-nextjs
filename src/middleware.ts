import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { config as authConfig } from "./config";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get(authConfig.jwtCookieName)?.value;
  const { pathname } = request.nextUrl;

  // Check if the current path is a public route
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Redirect to login if accessing protected route without token
  if (!token && !isPublicRoute) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to home if accessing public route with token
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For API routes, add token to Authorization header
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Authorization", `Bearer ${token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
