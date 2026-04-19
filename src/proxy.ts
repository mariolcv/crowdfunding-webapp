import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/proyectos", "/blog", "/login", "/registro", "/privacidad", "/cookies", "/aviso-legal", "/terminos"];
const authRoutes = ["/login", "/registro"];
const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as { role?: string })?.role === "ADMIN";

  // API routes: protect /api/admin and /api/wallet and /api/investments
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

  // Admin routes
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
    }
    return NextResponse.next();
  }

  // Auth routes: redirect to dashboard if already logged in
  if (authRoutes.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
