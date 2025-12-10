import { Streak } from "../models/streakModel.js";

const startOfDay = (date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

export const updateStreakOnActivity = async (
  userId,
  activityDate = new Date()
) => {
  const today = startOfDay(new Date(activityDate));

  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    });
    return streak;
  }

  const last = streak.lastActiveDate
    ? startOfDay(new Date(streak.lastActiveDate))
    : null;
  if (last && last.getTime() === today.getTime()) {
    return streak;
  }

  const diffDays = last
    ? Math.floor((today - last) / (1000 * 60 * 60 * 24))
    : null;
  const currentStreak =
    diffDays === 1 || diffDays === null ? streak.currentStreak + 1 : 1;
  const longestStreak = Math.max(streak.longestStreak, currentStreak);

  streak.currentStreak = currentStreak;
  streak.longestStreak = longestStreak;
  streak.lastActiveDate = today;
  await streak.save();
  return streak;
};

export const getUserStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    });
  }
  return streak;
};
