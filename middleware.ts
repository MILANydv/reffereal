import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user;
    const role = user?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

    // 1. If trying to access protected routes while not logged in
    if (isAdminRoute || isDashboardRoute) {
        if (!isLoggedIn) {
            let callbackUrl = nextUrl.pathname;
            if (nextUrl.search) {
                callbackUrl += nextUrl.search;
            }

            const encodedCallbackUrl = encodeURIComponent(callbackUrl);
            return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
        }

        // 2. If logged in as PARTNER but trying to access ADMIN routes
        if (isAdminRoute && role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard/v2", nextUrl));
        }
    }

    // 3. If logged in but trying to access login/signup pages
    if (isAuthRoute && isLoggedIn) {
        if (role === "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/admin/v2", nextUrl));
        }
        return NextResponse.redirect(new URL("/dashboard/v2", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
