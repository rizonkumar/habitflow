import {
  createLog,
  deleteLog,
  listLogs,
  updateLog,
} from "../services/healthService.js";
import { serializeHealthLog } from "../serializers/healthSerializer.js";

export const createHealthLogController = async (req, res, next) => {
  try {
    const log = await createLog({ ...req.validated.body, userId: req.userId });
    res.status(201).json({ log: serializeHealthLog(log) });
  } catch (error) {
    next(error);
  }
};

export const listHealthLogsController = async (req, res, next) => {
  try {
    const logs = await listLogs({ userId: req.userId, ...req.validated.query });
    res.json({ logs: logs.map(serializeHealthLog) });
  } catch (error) {
    next(error);
  }
};

export const updateHealthLogController = async (req, res, next) => {
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
};

export const deleteHealthLogController = async (req, res, next) => {
  try {
    await deleteLog({ logId: req.validated.params.logId, userId: req.userId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
