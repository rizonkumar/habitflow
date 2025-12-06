import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { initBoard, listBoard, createTask, moveTask, updateTask, deleteTask } from "../services/boardService.js";

const router = Router();

const projectParam = z.object({ projectId: z.string().min(1) });
const taskParam = z.object({ taskId: z.string().min(1) });

const createTaskSchema = z.object({
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

const moveTaskSchema = z.object({
  params: taskParam,
  body: z.object({
    statusColumnId: z.string().optional(),
    order: z.number().optional(),
  }),
});

const updateTaskSchema = z.object({
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

router.post("/:projectId/init", requireAuth, validate({ params: projectParam }), async (req, res, next) => {
  try {
    const columns = await initBoard({ projectId: req.validated.params.projectId, userId: req.userId });
    res.status(201).json({ columns });
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId", requireAuth, validate({ params: projectParam }), async (req, res, next) => {
  try {
    const board = await listBoard({ projectId: req.validated.params.projectId, userId: req.userId });
    res.json(board);
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/tasks", requireAuth, validate(createTaskSchema), async (req, res, next) => {
  try {
    const task = await createTask({
      projectId: req.validated.params.projectId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

router.post("/tasks/:taskId/move", requireAuth, validate(moveTaskSchema), async (req, res, next) => {
  try {
    const task = await moveTask({
      taskId: req.validated.params.taskId,
      userId: req.userId,
      statusColumnId: req.validated.body.statusColumnId,
      order: req.validated.body.order,
    });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.put("/tasks/:taskId", requireAuth, validate(updateTaskSchema), async (req, res, next) => {
  try {
    const task = await updateTask({
      taskId: req.validated.params.taskId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.delete("/tasks/:taskId", requireAuth, validate({ params: taskParam }), async (req, res, next) => {
  try {
    await deleteTask({ taskId: req.validated.params.taskId, userId: req.userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const boardRoutes = router;

