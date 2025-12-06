import jwt from "jsonwebtoken";
import { appError } from "../errors/appError.js";
import { appConfig } from "../config/env.js";
import { authErrors } from "../constants/authConstants.js";

export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return next(
      appError(authErrors.missingToken.status, authErrors.missingToken.message)
    );
  }

  try {
    const payload = jwt.verify(token, appConfig.jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return next(
      appError(authErrors.invalidToken.status, authErrors.invalidToken.message)
    );
  }
};
