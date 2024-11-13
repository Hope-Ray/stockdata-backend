import { Request, Response } from "express";
import pool from "../dbConfig/db";

// Get stock data
export const getStocks = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, topN } = req.query;

  // Check that startDate and endDate are not empty
  if (!startDate || !endDate) {
    res.status(400).json({ message: "startDate and endDate are required" });
    return; // Just exit the function after sending the response
  }

  try {
    let query = `SELECT "SYMBOL", "DATE", "CLOSE_PRICE" FROM stock_data WHERE "DATE" BETWEEN $1 AND $2`;
    const values: (string | number)[] = [
      startDate as string,
      endDate as string,
    ];

    // Check if topN is a valid number, and add it to the query and values if so
    if (topN && typeof topN === "string" && !isNaN(Number(topN))) {
      query += ` ORDER BY "CLOSE_PRICE" DESC LIMIT $3`;
      values.push(Number(topN));
    }

    const result = await pool.query(query, values);

    // Group the result by SYMBOL to make it easier to identify the data by symbol
    const groupedData = result.rows.reduce((acc, row) => {
      const { SYMBOL, DATE, CLOSE_PRICE } = row;
      if (!acc[SYMBOL]) {
        acc[SYMBOL] = [];
      }
      acc[SYMBOL].push({ DATE, CLOSE_PRICE });
      return acc;
    }, {});

    // Return the grouped data where each key is a symbol and the value is an array of date and close price pairs
    res.json(groupedData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ message: "Error fetching stock data" });
  }
};

export const getPieChartData = async (
  req: Request,
  // eslint-disable-next-line prettier/prettier
  res: Response
): Promise<void> => {
  const { startDate, endDate } = req.query;

  // Check that startDate and endDate are not empty
  if (!startDate || !endDate) {
    res.status(400).json({ message: "startDate and endDate are required" });
    return; // Exit after sending response
  }

  try {
    // Query to get the total ADJ TOTAL VOLUME, NET TURNOVER, and MARKET CAP for the specified date range
    const query = `
      SELECT
        SUM("ADJ TOTAL VOLUME") AS total_adjusted_volume,
        SUM("NET TURNOVER") AS total_net_turnover,
        SUM("MARKET CAP") AS total_market_cap
      FROM stock_data
      WHERE "DATE" BETWEEN $1 AND $2;
    `;
    const values: (string | number)[] = [
      startDate as string,
      endDate as string,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res
        .status(404)
        .json({ message: "No data found for the given date range" });
      return;
    }

    const data = result.rows[0];

    // Return the result as a response, formatted for a pie chart
    res.json({
      labels: ["Adjusted Total Volume", "Net Turnover", "Market Cap"],
      data: [
        data.total_adjusted_volume,
        data.total_net_turnover,
        data.total_market_cap,
      ],
    });
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ message: "Error fetching pie chart data" });
  }
};
