/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Service-Worker-Allowed',
          value: 'none'
        }
      ]
    }
  ]
};

export default nextConfig;