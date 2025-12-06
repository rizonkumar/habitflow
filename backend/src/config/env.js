import dotenv from "dotenv";

dotenv.config();

const read = (key, fallback) => process.env[key] || fallback;

export const appConfig = {
  port: Number(read("PORT", "4000")),
  mongoUri: read("MONGO_URI", ""),
  jwtSecret: read("JWT_SECRET", ""),
  nodeEnv: read("NODE_ENV", "development"),
};
