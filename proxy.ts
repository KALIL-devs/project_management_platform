import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const userRole = token?.role as string | undefined;

  // Unauthenticated user trying to access protected routes
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/client")
    ) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Authenticated user trying to access login page
  if (token && pathname === "/login") {
    if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (userRole === "EMPLOYEE") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (userRole === "CLIENT") return NextResponse.redirect(new URL("/client", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role enforcement for protected routes
  if (token) {
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return redirectUserByRole(userRole, request);
    }
    if (pathname.startsWith("/dashboard") && userRole !== "EMPLOYEE") {
      return redirectUserByRole(userRole, request);
    }
    if (pathname.startsWith("/client") && userRole !== "CLIENT") {
      return redirectUserByRole(userRole, request);
    }
  }

  return NextResponse.next();
}

function redirectUserByRole(role: string | undefined, request: NextRequest) {
  if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
  if (role === "EMPLOYEE") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (role === "CLIENT") return NextResponse.redirect(new URL("/client", request.url));
  return NextResponse.redirect(new URL("/login", request.url));
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/client/:path*", "/login"],
};
