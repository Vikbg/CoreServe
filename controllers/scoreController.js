import {
  saveScore,
  getTopScores,
  getScoresByPlayer,
} from "../models/scoreModel.js";
import { log } from "../utils/logger.js";
import client from "../redisClient.js";

// Enregistrer un score pour un joueur
export async function submitScore(req, res) {
  const { playerId, score } = req.body;

  await client.del("cache:/scores/leaderboard");
  await client.del(`cache:/scores/${playerId}`);
  log.warn(`Cache purgé: /scores/leaderboard et /scores/${playerId}`);

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ message: "Requête invalide." });
  }

  saveScore(playerId, score, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de l’enregistrement du score." });
    }

    res.status(201).json({ message: "Score enregistré avec succès." });
  });
}

// Récupérer les meilleurs scores (leaderboard)
export function getLeaderboard(req, res) {
  const limit = parseInt(req.query.limit) || 10;

  getTopScores(limit, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du classement." });
    }

    res.status(200).json(results);
  });
}

// Récupérer les scores d’un joueur
export function getPlayerScores(req, res) {
  const playerId = req.params.id;

  getScoresByPlayer(playerId, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des scores." });
    }

    res.status(200).json(results);
  });
}
