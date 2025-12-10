import { getUserStreak } from "../services/streakService.js";

export const getUserStreakController = async (req, res, next) => {
  try {
    const streak = await getUserStreak(req.userId);
    res.json({ streak });
  } catch (error) {
    next(error);
  }
};
