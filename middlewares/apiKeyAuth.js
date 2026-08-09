import db from "../db.js";
import { log } from "../utils/logger.js";
import { PLAN_LIMITS } from "../config/rateLimits.js";
import { LRUCache } from "lru-cache";
import { DEFAULT_TEST_API_KEY } from "../config/testDefaults.js";

const apiKeyCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 15,
});
const rateLimitCache = new LRUCache({
  max: 5000,
  ttl: 1000 * 60 * 15,
});

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

function getRateLimitState(rateLimitKey, windowMs) {
  const now = Date.now();
  const existingState = rateLimitCache.get(rateLimitKey);

  if (!existingState || existingState.resetAt <= now) {
    const newState = { count: 0, resetAt: now + windowMs };
    rateLimitCache.set(rateLimitKey, newState, { ttl: windowMs });
    return newState;
  }

  return existingState;
}

async function banApiKey(apiKey) {
  try {
    await db
      .promise()
      .query(
        "UPDATE api_keys SET banned_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE `key` = ?",
        [apiKey],
      );
    apiKeyCache.delete(apiKey);
  } catch (error) {
    log.error(`Failed to ban API key: ${error.message}`);
  }
}

async function getApiKeyRecord(apiKey) {
  const configuredTestApiKey = process.env.TEST_API_KEY || DEFAULT_TEST_API_KEY;

  if (process.env.NODE_ENV === "test" && apiKey === configuredTestApiKey) {
    return {
      user_id: null,
      plan: "admin",
      banned_until: null,
    };
  }

  const cachedRecord = apiKeyCache.get(apiKey);
  if (cachedRecord) {
    return cachedRecord;
  }

  const [rows] = await db
    .promise()
    .query(
      "SELECT user_id, plan, banned_until FROM api_keys WHERE `key` = ? LIMIT 1",
      [apiKey],
    );

  const keyRecord = rows[0] ?? null;
  if (keyRecord) {
    apiKeyCache.set(apiKey, keyRecord);
  }

  return keyRecord;
}

export default async function apiKeyMiddleware(req, res, next) {
  const apiKey = req.get("x-api-key")?.trim();
  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key." });
  }

  let keyRecord;
  try {
    keyRecord = await getApiKeyRecord(apiKey);
  } catch (error) {
    log.error(`API key lookup failed: ${error.message}`);
    return res.status(500).json({ error: "Internal server error." });
  }

  if (!keyRecord) {
    return res.status(403).json({ error: "Invalid API key." });
  }

  if (
    keyRecord.banned_until &&
    new Date(keyRecord.banned_until).getTime() > Date.now()
  ) {
    return res
      .status(403)
      .json({ error: "This API key is temporarily banned." });
  }

  const plan = keyRecord.plan || "free";
  const limits = getPlanLimits(plan);
  const rateLimitKey = `${apiKey}:${plan}`;
  const state = getRateLimitState(rateLimitKey, limits.windowMs);
  state.count += 1;
  rateLimitCache.set(rateLimitKey, state, {
    ttl: Math.max(state.resetAt - Date.now(), 1),
  });

  res.setHeader("RateLimit-Limit", String(limits.max));
  res.setHeader(
    "RateLimit-Remaining",
    String(Math.max(limits.max - state.count, 0)),
  );
  res.setHeader("RateLimit-Reset", String(Math.ceil(state.resetAt / 1000)));

  if (state.count > limits.max) {
    log.warn("Rate limit exceeded for an API key");
    await banApiKey(apiKey);
    return res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
  }

  req.apiKey = apiKey;
  req.apiPlan = plan;
  req.userId = keyRecord.user_id;
  return next();
}
