import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/employees"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isProtected = protectedPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employees/:path*"],
};
