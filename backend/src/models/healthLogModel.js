import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["water", "gym", "sleep", "diet", "custom"],
      required: true,
    },
    amount: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    metadata: { type: Object, default: {} },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const HealthLog = mongoose.model("HealthLog", healthLogSchema);
