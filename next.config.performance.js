/**
 * Next.js Performance Optimization Configuration
 *
 * This file shows the recommended performance settings.
 * Apply these settings to your actual next.config.js
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const config = {
  // ============================================================================
  // 1. COMPRESSION & MINIFICATION
  // ============================================================================

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Gzip compression
  compress: true,

  // ============================================================================
  // 2. STATIC GENERATION & REVALIDATION
  // ============================================================================

  // Incremental Static Regeneration
  revalidate: {
    // Cache static pages for 3600 seconds (1 hour)
    duration: 3600,
  },

  // ============================================================================
  // 3. IMAGE OPTIMIZATION
  // ============================================================================

  images: {
    // Optimize all images
    formats: ['image/avif', 'image/webp'],
    
    // Image sizes for responsive images
    sizes: [
      {
        breakpoint: 640,
        size: '100vw',
      },
      {
        breakpoint: 1024,
        size: '50vw',
      },
      {
        breakpoint: 1280,
        size: '33vw',
      },
    ],

    // Cache optimized images
    cacheControl: 'public, max-age=31536000, immutable',

    // Unoptimized images (remove for production if possible)
    unoptimized: false,
  },

  // ============================================================================
  // 4. FONT OPTIMIZATION
  // ============================================================================

  // Preload critical fonts
  fonts: {
    fallback: 'sans-serif',
  },

  // ============================================================================
  // 5. BUNDLE ANALYSIS
  // ============================================================================

  webpack: (config, { isServer }) => {
    // Tree-shaking for unused code
    config.optimization.usedExports = true;

    // Module concatenation
    config.optimization.concatenateModules = true;

    // Better code splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // React
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react-vendors',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Next.js
        nextCommon: {
          test: /[\\/].next[\\/]static[\\/]/,
          name: 'next-common',
          priority: 15,
          minSize: 0,
        },
        // Common code between pages
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },

  // ============================================================================
  // 6. HEADERS FOR CACHING
  // ============================================================================

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=120',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // 7. REDIRECTS FOR PERFORMANCE
  // ============================================================================

  async redirects() {
    return [
      // Remove trailing slashes
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },

  // ============================================================================
  // 8. BUILD OPTIMIZATION
  // ============================================================================

  // Enable experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],

    // Production source maps for error tracking
    productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === 'true',

    // Optimize CSS-in-JS
    optimizeCss: true,

    // Optimize default image placeholder
    optimizeImages: true,
  },

  // ============================================================================
  // 9. ENVIRONMENT VARIABLES
  // ============================================================================

  env: {
    // Performance thresholds
    PERF_BUDGET_JS: '250', // KB
    PERF_BUDGET_CSS: '50', // KB
    PERF_BUDGET_API: '500', // ms
  },
};

module.exports = withBundleAnalyzer(config);

/**
 * IMPLEMENTATION GUIDE
 *
 * 1. Install bundle analyzer:
 *    npm install --save-dev @next/bundle-analyzer
 *
 * 2. Apply these settings to your actual next.config.js:
 *    - Copy compression settings
 *    - Copy image optimization
 *    - Copy webpack configuration
 *    - Copy headers for caching
 *
 * 3. Run bundle analysis:
 *    ANALYZE=true npm run build
 *
 * 4. Monitor performance:
 *    - Check browser DevTools Performance tab
 *    - Use Lighthouse audit
 *    - Monitor Core Web Vitals
 *
 * 5. Set performance budgets:
 *    - JS bundle: < 250KB
 *    - CSS: < 50KB
 *    - Images: < 100KB each
 *    - API response: < 500ms
 *    - First Contentful Paint: < 1.8s
 *    - Largest Contentful Paint: < 2.5s
 */
