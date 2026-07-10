import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const role = (req.nextauth?.token as any)?.role;

    if (isAdminRoute && role !== "admin" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // must be logged in for every matched route
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/cbt/:path*", "/summaries/:path*", "/subscribe/:path*", "/admin/:path*"],
};
