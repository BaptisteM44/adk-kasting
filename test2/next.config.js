/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'supabase.com',
      'localhost',
      // Ajoutez ici vos domaines d'images
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  sassOptions: {
    includePaths: ['./styles'],
  },
  env: {
    CUSTOM_KEY: 'ADKcasting',
  }
}

module.exports = nextConfig