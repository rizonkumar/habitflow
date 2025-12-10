import { z } from "zod";

const idParam = z.object({ todoId: z.string().min(1) });

const prioritySchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(["low", "medium", "high"])
);

export const createTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    priority: prioritySchema.optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const listTodoSchema = z.object({
  query: z.object({
    projectId: z.string().min(1).optional(),
    status: z.enum(["todo", "completed"]).optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

export const updateTodoSchema = z.object({
  params: idParam,
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    priority: prioritySchema.optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const toggleTodoSchema = z.object({
  params: idParam,
  body: z.object({
    status: z.enum(["todo", "completed"]).optional(),
  }),
});

export const deleteTodoSchema = z.object({
  params: idParam,
});
