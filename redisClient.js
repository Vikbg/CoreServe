import dotenv from "dotenv";
import { createClient } from "redis";
import { log } from "./utils/logger.js";

dotenv.config();

const clientOptions = {
  ...(process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}),
  socket: {
    reconnectStrategy: false,
    connectTimeout: 1000,
  },
};
const client = createClient(clientOptions);
let redisReady = false;
let connectionAttempt;

client.on("ready", () => {
  redisReady = true;
  log.info("Redis connection is ready.");
});

client.on("end", () => {
  redisReady = false;
  log.warn("Redis connection closed.");
});

client.on("error", (error) => {
  redisReady = false;
  log.error(`Redis error: ${error.message}`);
  connectionAttempt = null;
});

export async function connectRedis() {
  if (connectionAttempt) {
    return connectionAttempt;
  }

  const spinner = log.spinner("Connecting to Redis...");
  spinner.start();

  connectionAttempt = client
    .connect()
    .then(() => {
      redisReady = true;
      spinner.succeed("Connected to Redis.");
      return client;
    })
    .catch((error) => {
      redisReady = false;
      connectionAttempt = null;
      spinner.fail("Redis is unavailable. Continuing without cache.");
      log.warn(`Redis cache disabled: ${error.message}`);
      return null;
    });

  return connectionAttempt;
}

export function isRedisReady() {
  return redisReady;
}

export async function getCacheValue(key) {
  if (!redisReady) {
    return null;
  }

  try {
    return await client.get(key);
  } catch (error) {
    redisReady = false;
    log.warn(`Failed to read Redis cache key "${key}": ${error.message}`);
    return null;
  }
}

export async function setCacheValue(key, ttlSeconds, value) {
  if (!redisReady) {
    return;
  }

  try {
    await client.setEx(key, ttlSeconds, value);
  } catch (error) {
    redisReady = false;
    log.warn(`Failed to write Redis cache key "${key}": ${error.message}`);
  }
}

export async function deleteCacheKey(key) {
  if (!redisReady) {
    return;
  }

  try {
    await client.del(key);
  } catch (error) {
    redisReady = false;
    log.warn(`Failed to delete Redis cache key "${key}": ${error.message}`);
  }
}

export async function deleteCacheByPrefix(prefix) {
  if (!redisReady) {
    return;
  }

  try {
    const keys = [];
    for await (const key of client.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    redisReady = false;
    log.warn(
      `Failed to delete Redis cache prefix "${prefix}": ${error.message}`,
    );
  }
}

await connectRedis();

export default client;
