import mongoose from "mongoose";
import { appConfig } from "./env.js";

export const connectDatabase = async () => {
  if (!appConfig.mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(appConfig.mongoUri);
  return mongoose.connection;
};
