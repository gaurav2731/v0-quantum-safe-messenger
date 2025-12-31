/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Capacitor mobile app - static export (only when building for mobile)
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  distDir: process.env.STATIC_EXPORT === 'true' ? 'out' : '.next',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,

  experimental: {
    esmExternals: 'loose',
  },

  webpack: (config, { isServer }) => {
    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Handle argon2-browser WebAssembly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig;
