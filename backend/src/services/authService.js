import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { appError } from "../errors/appError.js";
import { appConfig } from "../config/env.js";
import { authErrors } from "../constants/authConstants.js";

const emailInUse = async (email) => {
  const existing = await User.findOne({ email });
  return Boolean(existing);
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, appConfig.jwtSecret, {
    expiresIn: `${appConfig.accessTokenTtlMinutes}m`,
  });

const signRefreshToken = (userId, version) =>
  jwt.sign({ sub: userId, ver: version }, appConfig.jwtRefreshSecret, {
    expiresIn: `${appConfig.refreshTokenTtlDays}d`,
  });

const issueTokens = (user) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, user.refreshTokenVersion);
  return { accessToken, refreshToken };
};

export const signUp = async ({ name, email, password }) => {
  if (!name?.trim() || !email?.trim() || !password) {
    throw appError(
      authErrors.missingFields.status,
      authErrors.missingFields.message
    );
  }

  const emailTaken = await emailInUse(email);
  if (emailTaken) {
    throw appError(authErrors.emailInUse.status, authErrors.emailInUse.message);
  }

  if (password.length < 8) {
    throw appError(
      authErrors.weakPassword.status,
      authErrors.weakPassword.message
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  });

  const tokens = issueTokens(user);
  return { user, tokens };
};

export const logIn = async ({ email, password }) => {
  if (!email?.trim() || !password) {
    throw appError(
      authErrors.badCredentials.status,
      authErrors.badCredentials.message
    );
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw appError(
      authErrors.badCredentials.status,
      authErrors.badCredentials.message
    );
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw appError(
      authErrors.badCredentials.status,
      authErrors.badCredentials.message
    );
  }

  const tokens = issueTokens(user);
  return { user, tokens };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw appError(authErrors.notFound.status, authErrors.notFound.message);
  }
  return user;
};

export const refreshSession = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, appConfig.jwtRefreshSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw appError(
        authErrors.invalidToken.status,
        authErrors.invalidToken.message
      );
    }
    if (user.refreshTokenVersion !== payload.ver) {
      throw appError(
        authErrors.invalidToken.status,
        authErrors.invalidToken.message
      );
    }
    const tokens = issueTokens(user);
    return { user, tokens };
  } catch {
    throw appError(
      authErrors.invalidToken.status,
      authErrors.invalidToken.message
    );
  }
};

export const revokeRefresh = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
};

export const searchUserByEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "name email avatarUrl"
  );
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
  };
};
