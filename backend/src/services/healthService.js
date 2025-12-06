import { HealthLog } from "../models/healthLogModel.js";
import { appError } from "../errors/appError.js";
import { healthErrors } from "../constants/healthConstants.js";
import { updateStreakOnActivity } from "./streakService.js";
import { logActivity } from "./activityService.js";

export const createLog = async ({
  userId,
  type,
  amount,
  unit,
  metadata,
  date,
}) => {
  if (!type) {
    throw appError(
      healthErrors.missingType.status,
      healthErrors.missingType.message
    );
  }
  const log = await HealthLog.create({
    userId,
    type,
    amount: amount ?? 0,
    unit: unit || "",
    metadata: metadata || {},
    date: date ? new Date(date) : new Date(),
  });
  await updateStreakOnActivity(userId);
  await logActivity(userId, "health.log.created", { logId: log.id, type });
  return log;
};

export const listLogs = async ({ userId, type, from, to }) => {
  const criteria = { userId };
  if (type) criteria.type = type;
  if (from || to) {
    criteria.date = {};
    if (from) criteria.date.$gte = new Date(from);
    if (to) criteria.date.$lte = new Date(to);
  }
  return HealthLog.find(criteria).sort({ date: -1 });
};

export const updateLog = async ({
  logId,
  userId,
  amount,
  unit,
  metadata,
  date,
}) => {
  const log = await HealthLog.findOne({ _id: logId, userId });
  if (!log) {
    throw appError(healthErrors.notFound.status, healthErrors.notFound.message);
  }
  log.amount = amount ?? log.amount;
  log.unit = unit ?? log.unit;
  log.metadata = metadata ?? log.metadata;
  log.date = date ? new Date(date) : log.date;
  await log.save();
  return log;
};

export const deleteLog = async ({ logId, userId }) => {
  const log = await HealthLog.findOne({ _id: logId, userId });
  if (!log) {
    throw appError(healthErrors.notFound.status, healthErrors.notFound.message);
  }
  await HealthLog.deleteOne({ _id: logId, userId });
};
