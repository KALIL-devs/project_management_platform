import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // If not logged in and trying to access protected routes → redirect to login
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/client")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If logged in and trying to access login page → redirect to their dashboard
  if (token && pathname === "/login") {
    if (token.role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (token.role === "EMPLOYEE") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (token.role === "CLIENT") return NextResponse.redirect(new URL("/client", request.url));
  }

  // If wrong role tries to access wrong dashboard
  if (token) {
    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/dashboard") && token.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/client") && token.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/client/:path*", "/login"],
};