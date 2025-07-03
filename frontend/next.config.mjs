/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'maps.googleapis.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Add this configuration to allow your IP address
  allowedDevOrigins: [
    'localhost:3000',
    '192.168.1.8:3000',
    '192.168.84.*:3000', // Allow all IPs in your subnet
    '*.local:3000' // If you use .local domains
  ]
};

export default nextConfig;
