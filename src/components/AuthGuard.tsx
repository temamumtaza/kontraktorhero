"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { getSessionToken } from "@/app/login/page";

/**
 * Client-side route guard for /course pages.
 * Uses custom session token (not Convex Auth) to validate access.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const sessionToken = getSessionToken();
    const user = useQuery(api.users.getMe, { sessionToken });

    useEffect(() => {
        // Only guard /course routes
        if (!pathname.startsWith("/course")) return;

        // Wait for user data to resolve (undefined = loading)
        if (user === undefined) return;

        // No session or session expired
        if (user === null) {
            router.replace("/login");
            return;
        }

        // User exists but subscription not active
        if (user.subscriptionStatus !== "active") {
            const tier = user.tier || "starter";
            router.replace(`/checkout?tier=${tier}&reason=unpaid`);
        }
    }, [user, pathname, router]);

    // While loading session, show nothing (prevents flash)
    if (pathname.startsWith("/course") && user === undefined) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    // Not authenticated for /course routes
    if (pathname.startsWith("/course") && user === null) {
        return null;
    }

    return <>{children}</>;
}
