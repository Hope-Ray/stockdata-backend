const config = {
  dbName: process.env.DB_NAME,
  dbPort: parseInt(process.env.DB_PORT || "3000"),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
};

export default config;
