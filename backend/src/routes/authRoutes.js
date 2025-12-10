import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  currentUserController,
  loginController,
  logoutController,
  refreshSessionController,
  searchUserController,
  signUpController,
} from "../controllers/authController.js";
import {
  loginSchema,
  searchUserSchema,
  signUpSchema,
} from "../validators/authValidators.js";

const router = Router();

router.post("/signup", validate(signUpSchema), signUpController);

router.post("/login", validate(loginSchema), loginController);

router.get("/me", requireAuth, currentUserController);

router.post("/refresh", refreshSessionController);

router.post("/logout", requireAuth, logoutController);

router.get(
  "/users/search",
  requireAuth,
  validate(searchUserSchema),
  searchUserController
);

export const authRoutes = router;
