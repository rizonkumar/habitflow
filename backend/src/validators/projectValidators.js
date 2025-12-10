import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(["todo", "jira", "health", "mixed"]).optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    type: z.enum(["todo", "jira", "health", "mixed"]).optional(),
  }),
});
