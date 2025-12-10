import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getUserStreakController } from "../controllers/streakController.js";

const router = Router();

router.get("/me", requireAuth, getUserStreakController);

export const streakRoutes = router;
