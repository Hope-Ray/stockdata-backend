import { query } from "../dbConfig/db";

export const getStocks = async () => {
  const result = await query("SELECT * FROM stocks", []);
  return result.rows;
};
