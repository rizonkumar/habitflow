import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createHealthLogController,
  deleteHealthLogController,
  listHealthLogsController,
  updateHealthLogController,
} from "../controllers/healthController.js";
import {
  createHealthLogSchema,
  deleteHealthLogSchema,
  listHealthLogsSchema,
  updateHealthLogSchema,
} from "../validators/healthValidators.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createHealthLogSchema),
  createHealthLogController
);

router.get(
  "/",
  requireAuth,
  validate(listHealthLogsSchema),
  listHealthLogsController
);

router.put(
  "/:logId",
  requireAuth,
  validate(updateHealthLogSchema),
  updateHealthLogController
);

router.delete(
  "/:logId",
  requireAuth,
  validate(deleteHealthLogSchema),
  deleteHealthLogController
);

export const healthRoutes = router;
