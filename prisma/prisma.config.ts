const config = {
  datasource: {
    provider: "mysql",
    url: process.env.DATABASE_URL,
  },
  // accelerateUrl: process.env.ACCELERATE_URL, // Uncomment if using Accelerate
};

export default config;
