import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
    profile(params) {
        return {
            email: params.email as string,
            name: `${params.firstName || ""} ${params.lastName || ""}`.trim(),
            firstName: params.firstName as string | undefined,
            lastName: params.lastName as string | undefined,
            phone: params.phone as string | undefined,
            username: params.username as string | undefined,
            tier: params.tier as string | undefined,
            subscriptionStatus: "inactive",
        };
    },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [CustomPassword],
});
