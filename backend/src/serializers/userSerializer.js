export const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || "",
  preferences: user.preferences || {},
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

