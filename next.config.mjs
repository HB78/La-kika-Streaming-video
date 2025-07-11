/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "assets.nflxext.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "<APP_ID>.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "lime-worried-lungfish-409.mypinata.cloud",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**.mypinata.cloud",
      },
    ],
  },
};

export default nextConfig;
