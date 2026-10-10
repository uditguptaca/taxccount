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
    webpack: (config) => {
        // .sql files import as plain strings, so the database schema ships
        // inside the serverless function (src/db/migrations/index.ts).
        config.module.rules.push({ test: /\.sql$/, type: 'asset/source' });
        return config;
    },
};

export default nextConfig;
