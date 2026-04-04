/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
          if (isServer) {
            if (!config.externals) config.externals = [];
            config.externals.push('better-sqlite3');
          } else {
                  config.resolve.fallback = {
                            ...config.resolve.fallback,
                            fs: false,
                            path: false,
                            crypto: false,
                  };
          }
          return config;
    },
};

export default nextConfig;
