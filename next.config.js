/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: function (config, options) {
        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        // Fix for WASM in Next.js 14
        if (!options.isServer) {
            config.output.environment = { ...config.output.environment, asyncFunction: true };
        }

        return config;
    },
};

module.exports = nextConfig;
