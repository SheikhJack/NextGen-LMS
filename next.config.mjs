/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https',
        hostname: "images.pexels.com",
      },
      { 
        protocol: 'https',
        hostname: "*.googleusercontent.com",
      },
      { 
        protocol: 'https',
        hostname: "*.clerk.com",
      },
      { 
        protocol: 'https',
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;