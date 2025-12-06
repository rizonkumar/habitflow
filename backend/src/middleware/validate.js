import { appError } from "../errors/appError.js";

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return next(appError(400, "Invalid request", { issues: details }));
  }

  req.validated = parsed.data;
  return next();
};

