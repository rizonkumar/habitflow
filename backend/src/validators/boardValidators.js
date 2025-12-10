import { z } from "zod";

const projectParam = z.object({ projectId: z.string().min(1) });
const taskParam = z.object({ taskId: z.string().min(1) });

export const projectOnlySchema = z.object({ params: projectParam });
export const taskOnlySchema = z.object({ params: taskParam });

export const createTaskSchema = z.object({
  params: projectParam,
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    statusColumnId: z.string().min(1),
    assigneeId: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const moveTaskSchema = z.object({
  params: taskParam,
  body: z.object({
    statusColumnId: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: taskParam,
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.string().optional(),
  }),
});
