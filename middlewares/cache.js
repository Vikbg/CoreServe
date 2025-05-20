import client from "../redisClient.js";
import { log } from "../utils/logger.js";

// Génère une clé lisible en fonction de la route
function generateCacheKey(req) {
  if (req.baseUrl && req.path) {
    return `cache:${req.baseUrl}${req.path}${req.url.includes("?") ? req.url.split("?")[1] : ""}`;
  }
  return `cache:${req.originalUrl}`;
}

export async function cache(req, res, next) {
  if (req.method !== "GET") return next();

  const key = generateCacheKey(req);

  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      log.info(`Cache hit: ${key}`);
      return res.json(JSON.parse(cachedData));
    }

    // Intercepte la réponse pour la mettre en cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      client.setEx(key, 3600, JSON.stringify(body)); // TTL = 1h
      log.debug(`Cache saved: ${key}`);
      return originalJson(body);
    };

    next();
  } catch (err) {
    log.error("Cache error:", err);
    next();
  }
}
