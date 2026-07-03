import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import metricRoutes from "./routes/metricRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { getRedisClient } from "./config/redis.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/alerts", alertRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await getRedisClient(); // establishes connection (or in-memory fallback) up front

  app.listen(PORT, () => {
    console.log(`\n🚀 Highre Software Network Portal API running on http://localhost:${PORT}`);
    console.log(`   Run "npm run seed" once to populate demo devices & metrics.\n`);
  });
}

bootstrap();
