import { Pool } from "pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();
import config from "../config";

const pool = new Pool({
  user: config.dbUser,
  host: config.dbHost,
  database: config.dbName,
  password: config.dbPassword,
  port: config.dbPort,
});

pool.connect();

pool.on("error", (err) => {
  console.log("unexpected error on idle Pool", err);
  process.exit();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = (text: string, params: any[]) => {
  return pool.query(text, params);
};

export default pool;
