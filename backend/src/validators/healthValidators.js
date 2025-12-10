import { z } from "zod";

const logParam = z.object({ logId: z.string().min(1) });

export const createHealthLogSchema = z.object({
  body: z.object({
    type: z.enum(["water", "gym", "sleep", "diet", "custom"]),
    amount: z.number().optional(),
    unit: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    date: z.string().datetime().optional(),
  }),
});

export const listHealthLogsSchema = z.object({
  query: z.object({
    type: z.enum(["water", "gym", "sleep", "diet", "custom"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const updateHealthLogSchema = z.object({
  params: logParam,
  body: z.object({
    amount: z.number().optional(),
    unit: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    date: z.string().datetime().optional(),
  }),
});

export const deleteHealthLogSchema = z.object({ params: logParam });
