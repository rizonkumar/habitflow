import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [memberSchema], default: [] },
    type: { type: String, enum: ["todo", "jira", "health", "mixed"], default: "mixed" },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);

