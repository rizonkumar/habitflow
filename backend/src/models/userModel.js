import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    refreshTokenVersion: { type: Number, default: 0 },
    preferences: {
      defaultTheme: { type: String, default: "light" },
      defaultSection: { type: String, default: "todo" },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
