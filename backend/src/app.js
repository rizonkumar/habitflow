import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { authRoutes } from "./routes/authRoutes.js";
import { projectRoutes } from "./routes/projectRoutes.js";
import { todoRoutes } from "./routes/todoRoutes.js";
import { boardRoutes } from "./routes/boardRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { streakRoutes } from "./routes/streakRoutes.js";
import { membershipRoutes } from "./routes/membershipRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { appConfig } from "./config/env.js";

export const createApp = () => {
  const app = express();

  const allowedOrigins = appConfig.corsOrigin
    ? appConfig.corsOrigin.split(",").map((o) => o.trim())
    : [];

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/projects", membershipRoutes);
  app.use("/api/todos", todoRoutes);
  app.use("/api/board", boardRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/streaks", streakRoutes);

  app.use(errorHandler);

  return app;
};