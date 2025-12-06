import { ActivityLog } from "../models/activityLogModel.js";

export const logActivity = async (userId, type, metadata = {}) => {
  try {
    await ActivityLog.create({ userId, type, metadata });
  } catch (error) {
    // swallow activity errors to avoid blocking main flow
    console.error("Activity log failed", error.message);
  }
};

