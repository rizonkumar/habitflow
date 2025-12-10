import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectController,
  deleteProjectController,
  listProjectsController,
  updateProjectController,
} from "../controllers/projectController.js";
import {
  createProjectSchema,
  listProjectsSchema,
  updateProjectSchema,
} from "../validators/projectValidators.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createProjectSchema),
  createProjectController
);

router.get(
  "/",
  requireAuth,
  validate(listProjectsSchema),
  listProjectsController
);

router.put(
  "/:projectId",
  requireAuth,
  validate(updateProjectSchema),
  updateProjectController
);

router.delete(
  "/:projectId",
  requireAuth,
  validate(updateProjectSchema),
  deleteProjectController
);

export const projectRoutes = router;
