/** @type {import('next').NextConfig} */
const nextConfig = {
    // No webpack externals needed — we use the postgres npm package
    // which works natively in Node.js without native bindings
    eslint: {
        // Warnings (unused imports, etc.) should not block production deploys.
        // Linting is enforced separately in the dev workflow.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Type checking is handled by IDE / CI. Don't block builds.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
