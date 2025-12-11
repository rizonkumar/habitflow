import { z } from "zod";

const logParam = z.object({ logId: z.string().min(1) });

const waterSchema = z.object({
  type: z.literal("water"),
  glasses: z.number().int().min(0),
  milliliters: z.number().min(0).optional(),
  date: z.string().datetime().optional(),
});

const gymSchema = z.object({
  type: z.literal("gym"),
  workoutType: z.string().min(1),
  durationMinutes: z.number().min(0),
  caloriesBurned: z.number().min(0).optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

const sleepSchema = z.object({
  type: z.literal("sleep"),
  bedtime: z.string().datetime(),
  wakeTime: z.string().datetime(),
  quality: z.enum(["low", "good", "excellent"]),
  date: z.string().datetime().optional(),
});

const dietSchema = z.object({
  type: z.literal("diet"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().min(0),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

const customSchema = z.object({
  type: z.literal("custom"),
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  date: z.string().datetime().optional(),
});

const healthLogBodySchema = z.discriminatedUnion("type", [
  waterSchema,
  gymSchema,
  sleepSchema,
  dietSchema,
  customSchema,
]);

export const createHealthLogSchema = z.object({
  body: healthLogBodySchema,
});

export const listHealthLogsSchema = z.object({
  query: z.object({
    type: z.enum(["water", "gym", "sleep", "diet", "custom"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

const waterUpdateSchema = z.object({
  glasses: z.number().int().min(0).optional(),
  milliliters: z.number().min(0).optional(),
  date: z.string().datetime().optional(),
});

const gymUpdateSchema = z.object({
  workoutType: z.string().min(1).optional(),
  durationMinutes: z.number().min(0).optional(),
  caloriesBurned: z.number().min(0).optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

const sleepUpdateSchema = z.object({
  bedtime: z.string().datetime().optional(),
  wakeTime: z.string().datetime().optional(),
  quality: z.enum(["low", "good", "excellent"]).optional(),
  date: z.string().datetime().optional(),
});

const dietUpdateSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
});

const customUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
});

export const updateHealthLogSchema = z.object({
  params: logParam,
  body: z.union([
    waterUpdateSchema,
    gymUpdateSchema,
    sleepUpdateSchema,
    dietUpdateSchema,
    customUpdateSchema,
  ]),
});

export const deleteHealthLogSchema = z.object({ params: logParam });
