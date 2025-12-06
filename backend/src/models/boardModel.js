import mongoose from "mongoose";

const boardColumnSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const boardTaskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    statusColumnId: { type: mongoose.Schema.Types.ObjectId, ref: "BoardColumn", required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    tags: { type: [String], default: [] },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BoardColumn = mongoose.model("BoardColumn", boardColumnSchema);
export const BoardTask = mongoose.model("BoardTask", boardTaskSchema);

