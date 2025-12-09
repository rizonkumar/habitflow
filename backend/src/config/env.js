import dotenv from "dotenv";

dotenv.config();

const read = (key, fallback) => process.env[key] || fallback;

export const appConfig = {
  port: Number(read("PORT", "4000")),
  mongoUri: read("MONGO_URI", ""),
  jwtSecret: read("JWT_SECRET", ""),
  jwtRefreshSecret: read("JWT_REFRESH_SECRET", ""),
  accessTokenTtlMinutes: Number(read("ACCESS_TOKEN_TTL_MINUTES", "15")),
  refreshTokenTtlDays: Number(read("REFRESH_TOKEN_TTL_DAYS", "7")),
  nodeEnv: read("NODE_ENV", "development"),
  corsOrigin: read("CORS_ORIGIN", ""),
};