import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTodoController,
  deleteTodoController,
  listTodosController,
  toggleTodoController,
  updateTodoController,
} from "../controllers/todoController.js";
import {
  createTodoSchema,
  deleteTodoSchema,
  listTodoSchema,
  toggleTodoSchema,
  updateTodoSchema,
} from "../validators/todoValidators.js";

const router = Router();

router.post("/", requireAuth, validate(createTodoSchema), createTodoController);

router.get("/", requireAuth, validate(listTodoSchema), listTodosController);

router.put(
  "/:todoId",
  requireAuth,
  validate(updateTodoSchema),
  updateTodoController
);

router.post(
  "/:todoId/toggle",
  requireAuth,
  validate(toggleTodoSchema),
  toggleTodoController
);

router.delete(
  "/:todoId",
  requireAuth,
  validate(deleteTodoSchema),
  deleteTodoController
);

export const todoRoutes = router;
