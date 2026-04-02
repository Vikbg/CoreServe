import express from "express";
import {
  submitScore,
  getLeaderboard,
  getUserScores,
} from "../controllers/scoreController.js";
import { cache } from "../middlewares/cache.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import apiKeyMiddleware from "../middlewares/apiKeyAuth.js";

const router = express.Router();

router.use(apiKeyMiddleware, authenticateToken);

router.post("/", submitScore);
router.get("/leaderboard", cache, getLeaderboard);
router.get("/:id", cache, getUserScores);

export default router;
