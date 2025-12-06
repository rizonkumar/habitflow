import { appConfig } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { createApp } from "./app.js";

const start = async () => {
  await connectDatabase();
  const app = createApp();
  app.listen(appConfig.port, () => {
    console.log(`API running on port ${appConfig.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
