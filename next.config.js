/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        images: {
            unoptimized: true, //esto lo hemos añadido para crear un sitio estatico
        },
    },
}

module.exports = nextConfig
