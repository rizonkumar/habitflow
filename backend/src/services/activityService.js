import { ActivityLog } from "../models/activityLogModel.js";

export const logActivity = async (userId, type, metadata = {}) => {
  try {
    await ActivityLog.create({ userId, type, metadata });
  } catch (error) {
    console.error("Activity log failed", error.message);
  }
};
