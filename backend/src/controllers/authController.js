import {
  getCurrentUser,
  logIn,
  refreshSession,
  revokeRefresh,
  searchUserByEmail,
  signUp,
} from "../services/authService.js";
import { serializeUser } from "../serializers/userSerializer.js";
import { appConfig } from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: appConfig.nodeEnv === "production",
  path: "/",
};

export const signUpController = async (req, res, next) => {
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
};

export const loginController = async (req, res, next) => {
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
};

export const currentUserController = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const refreshSessionController = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ error: { message: "Missing refresh token" } });
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
};

export const logoutController = async (req, res, next) => {
  try {
    await revokeRefresh(req.userId);
    res.clearCookie("refreshToken", { ...cookieOptions, maxAge: 0 });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchUserController = async (req, res, next) => {
  try {
    const { email } = req.validated.query;
    const user = await searchUserByEmail(email);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
