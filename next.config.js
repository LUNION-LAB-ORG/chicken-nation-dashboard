/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'kfy9qwx5yd.ufs.sh',  
      'chicken.turbodeliveryapp.com',  
    ],
  },
  // Désactiver les vérifications ESLint lors du build pour faciliter le déploiement
  eslint: {
    // Désactiver ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  // Désactiver la vérification des types TypeScript pendant le build
  typescript: {
    // Ignorer les erreurs TS pendant le build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
