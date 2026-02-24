const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig