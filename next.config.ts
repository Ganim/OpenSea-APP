import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    // Allow any remote image (icons, avatars, thumbnails come from dynamic URLs)
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // Turbopack is enabled by default in Next.js 16+
  turbopack: {
    root: '..',
  },

  // Kiosk SW scope widening (Phase 5 / Plan 05-10 / Pitfall 7).
  // `/sw-kiosk.js` lives at the origin root but registers with scope /kiosk,
  // so browsers require the `Service-Worker-Allowed: /kiosk` header on the
  // JS file response. Default Next.js static serving does NOT set it.
  async headers() {
    return [
      {
        source: '/sw-kiosk.js',
        headers: [{ key: 'Service-Worker-Allowed', value: '/kiosk' }],
      },
    ];
  },

  // Bundle Analyzer - Enable with ANALYZE=true npm run build
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: !isServer,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
