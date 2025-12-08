import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTodo,
  listTodos,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "../services/todoService.js";
import { serializeTodo } from "../serializers/todoSerializer.js";

const router = Router();

const idParam = z.object({ todoId: z.string().min(1) });

const prioritySchema = z.preprocess(
  (value) => (typeof value === "string" ? value.toLowerCase() : value),
  z.enum(["low", "medium", "high"])
);

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    projectId: z.string().min(1).optional(),
    dueDate: z.string().datetime().optional(),
    priority: prioritySchema.optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const listSchema = z.object({
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

const updateSchema = z.object({
  params: idParam,
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    priority: prioritySchema.optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const toggleSchema = z.object({
  params: idParam,
  body: z.object({
    status: z.enum(["todo", "completed"]).optional(),
  }),
});

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  async (req, res, next) => {
    try {
      const todo = await createTodo({
        ...req.validated.body,
        ownerId: req.userId,
      });
      res.status(201).json({ todo: serializeTodo(todo) });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", requireAuth, validate(listSchema), async (req, res, next) => {
  try {
    const todos = await listTodos({
      projectId: req.validated.query.projectId,
      ownerId: req.userId,
      status: req.validated.query.status,
      from: req.validated.query.from,
      to: req.validated.query.to,
    });
    res.json({ todos: todos.map(serializeTodo) });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:todoId",
  requireAuth,
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const todo = await updateTodo({
        todoId: req.validated.params.todoId,
        ownerId: req.userId,
        ...req.validated.body,
      });
      res.json({ todo: serializeTodo(todo) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:todoId/toggle",
  requireAuth,
  validate(toggleSchema),
  async (req, res, next) => {
    try {
      const todo = await toggleTodo({
        todoId: req.validated.params.todoId,
        ownerId: req.userId,
        status: req.validated.body.status,
      });
      res.json({ todo: serializeTodo(todo) });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:todoId",
  requireAuth,
  validate(toggleSchema),
  async (req, res, next) => {
    try {
      await deleteTodo({
        todoId: req.validated.params.todoId,
        ownerId: req.userId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export const todoRoutes = router;
