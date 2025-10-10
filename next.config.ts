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

  // Mengabaikan error TypeScript selama build
  typescript: {
    // PERINGATAN: Opsi ini akan membuat Next.js secara diam-diam mengabaikan
    // semua error TypeScript saat build produksi.
    ignoreBuildErrors: true,
  },

  // Mengabaikan error ESLint selama build
  eslint: {
    // PERINGATAN: Opsi ini akan mencegah build gagal jika ada error ESLint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
