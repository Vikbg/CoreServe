import rateLimit from "express-rate-limit";
import db from "../db.js";
import { log } from "../utils/logger.js";
import { createRequire } from 'module';
import { PLAN_LIMITS } from "../config/rateLimits.js";

const require = createRequire(import.meta.url);
const { LRUCache } = require('lru-cache');

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 15 }); // 15 minutes

function createRateLimiter(key, max, windowMs) {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: () => key,
    message: { error: "Trop de requêtes. Réessaie plus tard." },
    handler: (req, res) => {
      log.warn(`Rate limit dépassée pour la clé : ${key}`);
      res.status(429).json({ error: "Rate limit dépassée." });

      // Optionnel : marquer la clé comme potentiellement abusive
      db.query(
        "UPDATE api_keys SET banned_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE `key` = ?",
        [key],
      );
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export default async function apiKeyMiddleware(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "Clé API manquante" });
  }

  // Cache check
  let keyData = cache.get(apiKey);

  if (!keyData) {
    try {
      const [results] = await db
        .promise()
        .query(
          "SELECT user_id, plan, banned_until FROM api_keys WHERE `key` = ? LIMIT 1",
          [apiKey],
        );

      if (results.length === 0) {
        return res.status(403).json({ error: "Clé API invalide" });
      }

      keyData = results[0];
      cache.set(apiKey, keyData);
    } catch (err) {
      log.error("Erreur DB apiKeyMiddleware:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  // Check bannissement
  if (keyData.banned_until && new Date(keyData.banned_until) > new Date()) {
    return res.status(403).json({ error: "Clé API temporairement bannie" });
  }

  // Choix du plan
  const plan = keyData.plan || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS["free"];

  // Appliquer le rate limiter spécifique à ce plan
  const limiter = createRateLimiter(apiKey, limits.max, limits.windowMs);
  limiter(req, res, () => {
    req.userId = keyData.user_id;
    next();
  });
}
