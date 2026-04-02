import {
  saveUserScore,
  getTopScores,
  getScoresByUser,
} from "../models/scoreModel.js";
import { deleteCacheByPrefix } from "../redisClient.js";
import { log } from "../utils/logger.js";

export async function submitScore(req, res) {
  const authenticatedUserId = Number(req.user?.id);
  const requestedUserId =
    req.body.playerId === undefined ? null : Number(req.body.playerId);
  const score = Number(req.body.score);

  if (!Number.isInteger(authenticatedUserId) || authenticatedUserId <= 0) {
    return res.status(401).json({ message: "Unauthenticated user." });
  }

  if (requestedUserId !== null && requestedUserId !== authenticatedUserId) {
    return res
      .status(403)
      .json({ message: "You may only submit scores for your own account." });
  }

  if (!Number.isFinite(score) || score < 0) {
    return res
      .status(400)
      .json({ message: "Score must be a non-negative number." });
  }

  try {
    const result = await saveUserScore(authenticatedUserId, score);

    await Promise.all([
      deleteCacheByPrefix("cache:/scores/leaderboard"),
      deleteCacheByPrefix(`cache:/scores/${authenticatedUserId}`),
    ]);
    log.info(
      `Cleared score cache for user ${authenticatedUserId} and leaderboard.`,
    );

    if (result === "created") {
      return res.status(201).json({ message: "Score recorded successfully." });
    }

    if (result === "updated") {
      return res.status(200).json({ message: "New personal best recorded." });
    }

    return res
      .status(200)
      .json({ message: "Score was not higher than the current record." });
  } catch (error) {
    log.error(`Failed to submit score: ${error.message}`);
    return res.status(500).json({ message: "Failed to save score." });
  }
}

export async function getLeaderboard(req, res) {
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requestedLimit)
    ? 10
    : Math.min(Math.max(requestedLimit, 1), 100);

  try {
    const results = await getTopScores(limit);
    return res.status(200).json(results);
  } catch (error) {
    log.error(`Failed to fetch leaderboard: ${error.message}`);
    return res
      .status(500)
      .json({ message: "Failed to fetch the leaderboard." });
  }
}

export async function getUserScores(req, res) {
  const userId = Number.parseInt(req.params.id, 10);
  const authenticatedUserId = Number(req.user?.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  if (authenticatedUserId !== userId) {
    return res
      .status(403)
      .json({ message: "You may only access your own score history." });
  }

  try {
    const results = await getScoresByUser(userId);

    if (!results || results.length === 0) {
      return res
        .status(404)
        .json({ message: `No scores found for user ID ${userId}.` });
    }

    return res.status(200).json(results);
  } catch (error) {
    log.error(`Failed to fetch user scores: ${error.message}`);
    return res.status(500).json({ message: "Failed to fetch user scores." });
  }
}
