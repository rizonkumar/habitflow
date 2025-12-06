import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getUserStreak } from "../services/streakService.js";

const router = Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const streak = await getUserStreak(req.userId);
    res.json({ streak });
  } catch (error) {
    next(error);
  }
});

export const streakRoutes = router;

