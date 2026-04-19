import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const authRoutes = ["/login", "/registro"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as { role?: string })?.role === "ADMIN";

  if (pathname.startsWith("/api/admin") && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    (pathname.startsWith("/api/investments") ||
      pathname.startsWith("/api/wallet") ||
      pathname.startsWith("/api/user")) &&
    !isLoggedIn
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    return NextResponse.next();
  }

  if (authRoutes.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
