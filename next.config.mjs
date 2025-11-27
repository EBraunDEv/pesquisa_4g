import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Aplica a configuração do PWA apenas em produção para evitar conflito com o Turbopack em desenvolvimento
const finalConfig = process.env.NODE_ENV === 'production'
  ? withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
    })(nextConfig)
  : nextConfig;

export default finalConfig;
