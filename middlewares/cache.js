import {
  deleteCacheKey,
  getCacheValue,
  setCacheValue,
} from "../redisClient.js";
import { log } from "../utils/logger.js";

export function buildCacheKey(req) {
  return `cache:${req.originalUrl}`;
}

export async function cache(req, res, next) {
  if (req.method !== "GET") {
    return next();
  }

  const key = buildCacheKey(req);

  try {
    const cachedData = await getCacheValue(key);
    if (cachedData) {
      log.info(`Cache hit: ${key}`);

      try {
        return res.json(JSON.parse(cachedData));
      } catch {
        await deleteCacheKey(key);
      }
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void setCacheValue(key, 3600, JSON.stringify(body))
          .then(() => {
            log.debug(`Cache saved: ${key}`);
          })
          .catch((error) => {
            log.error(`Failed to persist cache for ${key}: ${error.message}`);
          });
      }

      return originalJson(body);
    };

    return next();
  } catch (error) {
    log.error(`Cache middleware error: ${error.message}`);
    return next();
  }
}
