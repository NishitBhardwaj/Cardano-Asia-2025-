/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [320, 420, 768, 1024, 1200],
    },
    
    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    
    // Performance optimizations
    poweredByHeader: false,
    
    webpack: function (config, options) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        // Fix for WASM in Next.js 14
        if (!options.isServer) {
            config.output.environment = { ...config.output.environment, asyncFunction: true };
        }

        // Optimize bundle size
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            // Fix webpack chunk issues
            chunkIds: 'deterministic',
        };

        // Fix for vendor-chunks issues
        config.resolve = {
            ...config.resolve,
            alias: {
                ...config.resolve.alias,
            },
        };

        return config;
    },
};

module.exports = nextConfig;
