import dotenv from "dotenv";
import express from "express";
import { log } from "./utils/logger.js";
import helmet from "helmet";

const app = express();
app.use(helmet());
dotenv.config();

import playerRoutes from "./routes/authRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";

// Middleware JSON
app.use(express.json());

// Routes
app.use("/players", playerRoutes);
app.use("/scores", scoreRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.info(`Serveur démarré sur http://0.0.0.0:${PORT}`);
});

export default app;
