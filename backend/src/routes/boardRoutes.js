import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskController,
  deleteTaskController,
  initBoardController,
  listBoardController,
  moveTaskController,
  updateTaskController,
} from "../controllers/boardController.js";
import {
  createTaskSchema,
  moveTaskSchema,
  projectOnlySchema,
  taskOnlySchema,
  updateTaskSchema,
} from "../validators/boardValidators.js";

const router = Router();

router.post(
  "/:projectId/init",
  requireAuth,
  validate(projectOnlySchema),
  initBoardController
);

router.get(
  "/:projectId",
  requireAuth,
  validate(projectOnlySchema),
  listBoardController
);

router.post(
  "/:projectId/tasks",
  requireAuth,
  validate(createTaskSchema),
  createTaskController
);

router.post(
  "/tasks/:taskId/move",
  requireAuth,
  validate(moveTaskSchema),
  moveTaskController
);

router.put(
  "/tasks/:taskId",
  requireAuth,
  validate(updateTaskSchema),
  updateTaskController
);

router.delete(
  "/tasks/:taskId",
  requireAuth,
  validate(taskOnlySchema),
  deleteTaskController
);

export const boardRoutes = router;
