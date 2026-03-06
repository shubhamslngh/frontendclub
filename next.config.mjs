/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "api.kk11.in",
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.kk11.in",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
