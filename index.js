import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import os from "os";
import cors from "cors";
import { pathToFileURL } from "url";
import { log } from "./utils/logger.js";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

function resolveHostAddress(host) {
  let resolvedHost = host;

  if (resolvedHost === "0.0.0.0") {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
      for (const iface of interfaces[interfaceName] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          resolvedHost = iface.address;
          break;
        }
      }

      if (resolvedHost !== "0.0.0.0") {
        break;
      }
    }
  }

  return resolvedHost;
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: process.env.JSON_LIMIT || "10kb" }));

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/players", authRoutes);
  app.use("/scores", scoreRoutes);

  return app;
}

const app = createApp();

export function startServer() {
  return app.listen(PORT, HOST, () => {
    const resolvedHost = resolveHostAddress(HOST);
    log.info(`CoreServe started at http://${resolvedHost}:${PORT}`);
  });
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  startServer();
}

export default app;
