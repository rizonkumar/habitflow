import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createLog, listLogs, updateLog, deleteLog } from "../services/healthService.js";
import { serializeHealthLog } from "../serializers/healthSerializer.js";

const router = Router();

const logParam = z.object({ logId: z.string().min(1) });

const createSchema = z.object({
  body: z.object({
    type: z.enum(["water", "gym", "sleep", "diet", "custom"]),
    amount: z.number().optional(),
    unit: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    date: z.string().datetime().optional(),
  }),
});

const listSchema = z.object({
  query: z.object({
    type: z.enum(["water", "gym", "sleep", "diet", "custom"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

const updateSchema = z.object({
  params: logParam,
  body: z.object({
    amount: z.number().optional(),
    unit: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    date: z.string().datetime().optional(),
  }),
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const log = await createLog({ ...req.validated.body, userId: req.userId });
    res.status(201).json({ log: serializeHealthLog(log) });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, validate(listSchema), async (req, res, next) => {
  try {
    const logs = await listLogs({ userId: req.userId, ...req.validated.query });
    res.json({ logs: logs.map(serializeHealthLog) });
  } catch (error) {
    next(error);
  }
});

router.put("/:logId", requireAuth, validate(updateSchema), async (req, res, next) => {
  try {
    const log = await updateLog({
      logId: req.validated.params.logId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.json({ log: serializeHealthLog(log) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:logId", requireAuth, validate({ params: logParam }), async (req, res, next) => {
  try {
    await deleteLog({ logId: req.validated.params.logId, userId: req.userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const healthRoutes = router;

