/** @type {import('next').NextConfig} */
const API_REWRITES = [
  ["/health", "/health"],
  ["/me", "/me"],
  ["/integrations", "/integrations"],
  ["/integrations/:path*", "/integrations/:path*"],
  ["/auth/:path*", "/auth/:path*"],
  ["/personas", "/personas"],
  ["/personas/:path*", "/personas/:path*"],
  ["/history", "/history"],
  ["/history/:path*", "/history/:path*"],
  ["/format", "/format"],
  ["/ai/:path*", "/ai/:path*"],
  ["/gmail/:path*", "/gmail/:path*"],
];

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiTarget = process.env.MELLO_API_URL || "http://localhost:4010";
    return API_REWRITES.map(([source, destination]) => ({
      source,
      destination: `${apiTarget}${destination}`,
    }));
  },
};

export default nextConfig;
