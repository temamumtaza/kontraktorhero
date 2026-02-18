// Convex Auth configuration
// This file is used by @convex-dev/auth
const authConfig = {
    providers: [
        {
            domain: process.env.CONVEX_SITE_URL,
            applicationID: "convex",
        },
    ],
};

export default authConfig;
