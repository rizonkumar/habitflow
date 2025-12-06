import { Router } from "express";
import { z } from "zod";
import { logIn, signUp, getCurrentUser } from "../services/authService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

router.post("/signup", validate(signUpSchema), async (req, res, next) => {
  try {
    const { user, token } = await signUp(req.validated.body);
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { user, token } = await logIn(req.validated.body);
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export const authRoutes = router;
