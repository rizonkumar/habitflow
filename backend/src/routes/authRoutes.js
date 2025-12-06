import { Router } from "express";
import { z } from "zod";
import { logIn, signUp, getCurrentUser, refreshSession, revokeRefresh } from "../services/authService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { serializeUser } from "../serializers/userSerializer.js";
import { appConfig } from "../config/env.js";

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

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: appConfig.nodeEnv === "production",
  path: "/",
};

router.post("/signup", validate(signUpSchema), async (req, res, next) => {
  try {
    const { user, tokens } = await signUp(req.validated.body);
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: appConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      user: serializeUser(user),
      token: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { user, tokens } = await logIn(req.validated.body);
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: appConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
    res.json({
      user: serializeUser(user),
      token: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: { message: "Missing refresh token" } });
    }
    const { user, tokens } = await refreshSession(token);
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: appConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    });
    res.json({ user: serializeUser(user), token: tokens.accessToken });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await revokeRefresh(req.userId);
    res.clearCookie("refreshToken", { ...cookieOptions, maxAge: 0 });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const authRoutes = router;
