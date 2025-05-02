/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // allow larger image uploads
    }
  }
};

module.exports = nextConfig;