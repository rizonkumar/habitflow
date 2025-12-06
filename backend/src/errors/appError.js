export const appError = (status, message, details = {}) => ({
  status,
  message,
  details,
});
