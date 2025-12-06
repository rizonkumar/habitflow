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

const createToken = (userId) =>
  jwt.sign({ sub: userId }, appConfig.jwtSecret, { expiresIn: "7d" });

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

  const token = createToken(user.id);
  return { user, token };
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

  const token = createToken(user.id);
  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) {
    throw appError(404, "User not found");
  }
  return user;
};
