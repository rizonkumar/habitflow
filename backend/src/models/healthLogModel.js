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
    date: { type: Date, required: true },

    glasses: { type: Number },
    milliliters: { type: Number },

    workoutType: { type: String },
    durationMinutes: { type: Number },
    caloriesBurned: { type: Number },
    notes: { type: String },

    bedtime: { type: Date },
    wakeTime: { type: Date },
    sleepDurationMinutes: { type: Number },
    quality: { type: String, enum: ["low", "good", "excellent"] },

    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"] },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    description: { type: String },

    name: { type: String },
    value: { type: Number },
    unit: { type: String },
  },
  { timestamps: true }
);

export const HealthLog = mongoose.model("HealthLog", healthLogSchema);
