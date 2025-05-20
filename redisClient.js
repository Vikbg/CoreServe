// redisClient.js
import redis from "redis";
import { log } from "./utils/logger.js";

const client = redis.createClient();

const spinner = log.spinner("Connexion à Redis...");
spinner.start();

try {
  await client.connect();
  spinner.succeed("Redis connected with succeed.");
  log.success("Redis Server is ready !");
} catch (err) {
  spinner.fail("Fail with Redis connection.");
  log.error("Redis error:", err);
}

client.on("error", (err) => log.error("Redis error (event):", err));

export default client;
