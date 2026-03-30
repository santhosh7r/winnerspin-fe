/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/djcz1dyym/image/upload/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.winnerspin.in.net//:path*", // Proxy to Backend
        // destination: "http://localhost:3000/:path*", // Proxy to Backend

      },
    ];
  },
};

export default nextConfig;