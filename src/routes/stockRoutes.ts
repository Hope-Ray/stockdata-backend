// routes/stockRoutes.ts
import express from "express";
import { getStocks, getPieChartData } from "../controllers/stockController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Route for each user type
router.get("/line-chart", authMiddleware(["user1"]), getStocks);
router.get("/bar-chart", authMiddleware(["user2"]), getStocks);
router.get("/pie-chart", authMiddleware(["user3"]), getPieChartData);

export default router;
