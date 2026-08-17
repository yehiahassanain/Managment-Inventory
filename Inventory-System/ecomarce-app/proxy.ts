import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/jwt";

const PUBLIC_ROUTES = ["/login"];
const PROTECTED_PREFIX = "/dashboard";
const ADMIN_ONLY_PREFIX = "/dashboard/analytics";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAnalytics = pathname.startsWith(ADMIN_ONLY_PREFIX);
  const isUsersManagement = pathname === "/dashboard";

  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect non-admin users away from admin-only pages (Analytics and Users Management)
  if (session && session.role !== "ADMIN") {
    if (isAnalytics || isUsersManagement) {
      return NextResponse.redirect(new URL("/dashboard/products", request.url));
    }
  }

  // Redirect authenticated users away from the login page
  if (isPublic && session) {
    const destination = session.role === "ADMIN" ? "/dashboard" : "/dashboard/products";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
