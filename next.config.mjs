/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour les gros fichiers
  experimental: {
    serverComponentsExternalPackages: ["pinata"],
  },
  // Augmenter la limite de taille des fichiers pour les API routes
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Limite pour les petits fichiers
    },
    responseLimit: false,
  },
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
    ],
  },
};

export default nextConfig;
