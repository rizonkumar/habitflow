import {
  createTask,
  deleteTask,
  initBoard,
  listBoard,
  moveTask,
  updateTask,
} from "../services/boardService.js";
import {
  serializeColumn,
  serializeTask,
} from "../serializers/boardSerializer.js";

export const initBoardController = async (req, res, next) => {
  try {
    const columns = await initBoard({
      projectId: req.validated.params.projectId,
      userId: req.userId,
    });
    res.status(201).json({ columns: columns.map(serializeColumn) });
  } catch (error) {
    next(error);
  }
};

export const listBoardController = async (req, res, next) => {
  try {
    const board = await listBoard({
      projectId: req.validated.params.projectId,
      userId: req.userId,
    });
    res.json({
      columns: board.columns.map(serializeColumn),
      tasks: board.tasks.map(serializeTask),
    });
  } catch (error) {
    next(error);
  }
};

export const createTaskController = async (req, res, next) => {
  try {
    const task = await createTask({
      projectId: req.validated.params.projectId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.status(201).json({ task: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

export const moveTaskController = async (req, res, next) => {
  try {
    const task = await moveTask({
      taskId: req.validated.params.taskId,
      userId: req.userId,
      statusColumnId: req.validated.body.statusColumnId,
      order: req.validated.body.order,
    });
    res.json({ task: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

export const updateTaskController = async (req, res, next) => {
  try {
    const task = await updateTask({
      taskId: req.validated.params.taskId,
      userId: req.userId,
      ...req.validated.body,
    });
    res.json({ task: serializeTask(task) });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskController = async (req, res, next) => {
  try {
    await deleteTask({
      taskId: req.validated.params.taskId,
      userId: req.userId,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
