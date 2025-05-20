import express from "express";
import {
  submitScore,
  getLeaderboard,
  getPlayerScores,
} from "../controllers/scoreController.js";
import { cache } from "../middlewares/cache.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import apiKeyMiddleware from "../middlewares/apiKeyAuth.js";

const router = express.Router();

router.use(apiKeyMiddleware, authenticateToken); // Toutes les routes sont protégées

// Soumettre un score
router.post("/", submitScore);

// Récupérer les meilleurs scores (classement général)
router.get("/leaderboard", cache, getLeaderboard);

// Récupérer tous les scores d’un joueur spécifique
router.get("/:id", cache, getPlayerScores);

export default router;
