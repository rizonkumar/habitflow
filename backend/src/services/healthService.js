import { HealthLog } from "../models/healthLogModel.js";
import { appError } from "../errors/appError.js";
import { healthErrors } from "../constants/healthConstants.js";
import { updateStreakOnActivity } from "./streakService.js";
import { logActivity } from "./activityService.js";

const calculateSleepDuration = (bedtime, wakeTime) => {
  const bed = new Date(bedtime);
  const wake = new Date(wakeTime);
  return Math.round((wake - bed) / (1000 * 60));
};

export const createLog = async (data) => {
  const { userId, type, date, ...fields } = data;

  if (!type) {
    throw appError(
      healthErrors.missingType.status,
      healthErrors.missingType.message
    );
  }

  const logData = {
    userId,
    type,
    date: date ? new Date(date) : new Date(),
  };

  if (type === "water") {
    logData.glasses = fields.glasses;
    logData.milliliters = fields.milliliters;
  } else if (type === "gym") {
    logData.workoutType = fields.workoutType;
    logData.durationMinutes = fields.durationMinutes;
    logData.caloriesBurned = fields.caloriesBurned;
    logData.notes = fields.notes;
  } else if (type === "sleep") {
    logData.bedtime = new Date(fields.bedtime);
    logData.wakeTime = new Date(fields.wakeTime);
    logData.quality = fields.quality;
    logData.sleepDurationMinutes = calculateSleepDuration(
      fields.bedtime,
      fields.wakeTime
    );
  } else if (type === "diet") {
    logData.mealType = fields.mealType;
    logData.calories = fields.calories;
    logData.protein = fields.protein;
    logData.carbs = fields.carbs;
    logData.fat = fields.fat;
    logData.description = fields.description;
  } else if (type === "custom") {
    logData.name = fields.name;
    logData.value = fields.value;
    logData.unit = fields.unit;
  }

  const log = await HealthLog.create(logData);
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

export const updateLog = async (data) => {
  const { logId, userId, date, ...fields } = data;

  const log = await HealthLog.findOne({ _id: logId, userId });
  if (!log) {
    throw appError(healthErrors.notFound.status, healthErrors.notFound.message);
  }

  if (date) log.date = new Date(date);

  if (log.type === "water") {
    if (fields.glasses !== undefined) log.glasses = fields.glasses;
    if (fields.milliliters !== undefined) log.milliliters = fields.milliliters;
  } else if (log.type === "gym") {
    if (fields.workoutType !== undefined) log.workoutType = fields.workoutType;
    if (fields.durationMinutes !== undefined)
      log.durationMinutes = fields.durationMinutes;
    if (fields.caloriesBurned !== undefined)
      log.caloriesBurned = fields.caloriesBurned;
    if (fields.notes !== undefined) log.notes = fields.notes;
  } else if (log.type === "sleep") {
    if (fields.bedtime !== undefined) log.bedtime = new Date(fields.bedtime);
    if (fields.wakeTime !== undefined) log.wakeTime = new Date(fields.wakeTime);
    if (fields.quality !== undefined) log.quality = fields.quality;
    if (log.bedtime && log.wakeTime) {
      log.sleepDurationMinutes = calculateSleepDuration(
        log.bedtime,
        log.wakeTime
      );
    }
  } else if (log.type === "diet") {
    if (fields.mealType !== undefined) log.mealType = fields.mealType;
    if (fields.calories !== undefined) log.calories = fields.calories;
    if (fields.protein !== undefined) log.protein = fields.protein;
    if (fields.carbs !== undefined) log.carbs = fields.carbs;
    if (fields.fat !== undefined) log.fat = fields.fat;
    if (fields.description !== undefined) log.description = fields.description;
  } else if (log.type === "custom") {
    if (fields.name !== undefined) log.name = fields.name;
    if (fields.value !== undefined) log.value = fields.value;
    if (fields.unit !== undefined) log.unit = fields.unit;
  }

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
