import { appError } from "../errors/appError.js";

export const errorHandler = (err, _req, res, _next) => {
  const normalized = err?.status
    ? err
    : appError(500, "Internal server error", { cause: err?.message });

  res.status(normalized.status).json({
    error: {
      message: normalized.message,
      details: normalized.details,
    },
  });
};
