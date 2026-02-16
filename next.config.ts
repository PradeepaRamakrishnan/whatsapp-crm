import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: {
    position: 'top-right',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'samatva-dev.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'samatva-prod.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
