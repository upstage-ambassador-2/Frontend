/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiTarget =
      process.env.MELLO_API_URL ||
      process.env.MELLO_MOCK_API_URL ||
      "http://localhost:4010";
    return [
      {
        source: "/mock-api/:path*",
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
