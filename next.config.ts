/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Koma (,) seharusnya TIDAK ADA di sini setelah "https"
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/**",
      },
      {
        // Koma (,) seharusnya TIDAK ADA di sini setelah "https"
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
