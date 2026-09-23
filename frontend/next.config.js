/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/patient/login',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
