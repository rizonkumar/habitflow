import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createProject, listProjects, updateProject, deleteProject } from "../services/projectService.js";

const router = Router();

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(["todo", "jira", "health", "mixed"]).optional(),
  }),
});

const updateSchema = z.object({
  params: z.object({ projectId: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

const listSchema = z.object({
  query: z.object({
    type: z.enum(["todo", "jira", "health", "mixed"]).optional(),
  }),
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const project = await createProject({ ...req.validated.body, userId: req.userId });
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, validate(listSchema), async (req, res, next) => {
  try {
    const projects = await listProjects(req.userId, req.validated.query);
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.put("/:projectId", requireAuth, validate(updateSchema), async (req, res, next) => {
  try {
    const project = await updateProject({
      projectId: req.validated.params.projectId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.json({ project });
  } catch (error) {
    next(error);
  }
});

router.delete("/:projectId", requireAuth, validate(updateSchema), async (req, res, next) => {
  try {
    await deleteProject({ projectId: req.validated.params.projectId, userId: req.userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const projectRoutes = router;

