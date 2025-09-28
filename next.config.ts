/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    // ## INI BAGIAN PENTING ##
    // Hanya abaikan error build jika environment variable VERCEL_ENV adalah 'preview'.
    // Untuk build produksi (saat VERCEL_ENV adalah 'production'), nilai ini akan menjadi 'false'.
    // ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
