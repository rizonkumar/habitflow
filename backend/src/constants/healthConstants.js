export const healthErrors = {
  missingType: { status: 400, message: "Log type is required" },
  notFound: { status: 404, message: "Health log not found" },
  forbidden: { status: 403, message: "Not allowed for this log" },
};
