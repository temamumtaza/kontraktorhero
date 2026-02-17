import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh Session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Protected Routes: /course/*
    if (path.startsWith("/course")) {
        // 1. Must be logged in -> redirect to /login
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // 2. Must have active subscription -> redirect to /checkout
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, tier")
            .eq("id", user.id)
            .single();

        if (!profile || profile.subscription_status !== "active") {
            const tier = profile?.tier || "starter";
            return NextResponse.redirect(
                new URL(`/checkout?tier=${tier}&reason=unpaid`, request.url)
            );
        }
    }

    // If user is already logged in AND active, redirect away from /login and /checkout
    if (path === "/login" || path === "/checkout") {
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_status")
                .eq("id", user.id)
                .single();

            if (profile?.subscription_status === "active") {
                // Already paid, go straight to course
                return NextResponse.redirect(new URL("/course", request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/course/:path*",
        "/login",
        "/checkout",
    ],
};
