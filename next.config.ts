import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Menu data: owner edits invalidate by tag immediately; the short revalidate window is a safety
    // net that self-heals any regeneration race within a minute.
    menu: { stale: 30, revalidate: 60, expire: 3600 },
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    qualities: [70, 85],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/v0/b/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      // Firebase Storage emulator (development and tests only).
      ...(useEmulators
        ? ([
            { protocol: 'http', hostname: '127.0.0.1', port: '9199', pathname: '/**' },
            { protocol: 'http', hostname: 'localhost', port: '9199', pathname: '/**' },
          ] as const)
        : []),
    ],
    // The emulator serves images from a local IP; only allowed while running against emulators.
    dangerouslyAllowLocalIP: useEmulators || isDev,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
