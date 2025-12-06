export const authErrors = {
  missingToken: { status: 401, message: "Missing token" },
  invalidToken: { status: 401, message: "Invalid token" },
  emailInUse: { status: 409, message: "Email already in use" },
  badCredentials: { status: 401, message: "Invalid credentials" },
  notFound: { status: 404, message: "User not found" },
  weakPassword: {
    status: 400,
    message: "Password must be at least 8 characters",
  },
  missingFields: {
    status: 400,
    message: "Name, email, and password are required",
  },
};
