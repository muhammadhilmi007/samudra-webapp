/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"], // Add your backend domain for image loading
  },
  env: {
    API_URL: process.env.API_URL || "http://localhost:5000/api",
  },
};

export default nextConfig;
