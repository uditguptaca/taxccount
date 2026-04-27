/** @type {import('next').NextConfig} */
const nextConfig = {
    // No webpack externals needed — we use the postgres npm package
    // which works natively in Node.js without native bindings
};

export default nextConfig;
