"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    if (!convex) {
        // During SSG/build when env var is unavailable, render without Convex
        return <>{children}</>;
    }
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
