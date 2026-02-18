import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Minimal middleware — auth protection is now handled
 * client-side via AuthGuard component in the course layout.
 * This middleware only handles basic security headers.
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Basic security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
}

export const config = {
    matcher: [
        // Match all paths except static files and API routes
        "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
