/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
    staticPageGenerationTimeout: 300,
    images: {
        domains: [
        'www.notion.so',
        'notion.so',
        'images.unsplash.com',
        'pbs.twimg.com',
        's3.us-west-2.amazonaws.com'
        ],
        formats: ['image/avif', 'image/webp'],
    },
    reactStrictMode: true,
    experimental: {
        appDir: true,
        serverActions: true,
    },
    webpack: (config, { webpack }) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        }
        config.externals.push({
            sharp: "commonjs sharp",
            canvas: "commonjs canvas",
        })
        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
                process: "process/browser",
            })
        )
        return config
    },
})
