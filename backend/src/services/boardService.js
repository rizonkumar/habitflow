import { BoardColumn, BoardTask } from "../models/boardModel.js";
import { Project } from "../models/projectModel.js";
import { appError } from "../errors/appError.js";
import { boardErrors } from "../constants/boardConstants.js";
import { projectErrors } from "../constants/projectConstants.js";
import { updateStreakOnActivity } from "./streakService.js";
import { logActivity } from "./activityService.js";

const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }
  const member = project.members.find((m) => m.userId.toString() === userId);
  const role = member?.role;
  if (!role) {
    throw appError(boardErrors.forbidden.status, boardErrors.forbidden.message);
  }
  return { project, role };
};

const ensureBoardWriteAccess = (role) => {
  if (role === "viewer") {
    throw appError(boardErrors.forbidden.status, boardErrors.forbidden.message);
  }
};

export const initBoard = async ({ projectId, userId }) => {
  await ensureProjectAccess(projectId, userId);
  const existing = await BoardColumn.find({ projectId });
  if (existing.length > 0) {
    return existing;
  }
  const columns = await BoardColumn.insertMany([
    { projectId, name: "Todo", order: 0 },
    { projectId, name: "Pending", order: 1 },
    { projectId, name: "Completed", order: 2 },
  ]);
  return columns;
};

export const listBoard = async ({ projectId, userId }) => {
  await ensureProjectAccess(projectId, userId);
  const columns = await BoardColumn.find({ projectId }).sort({ order: 1 });
  const tasks = await BoardTask.find({ projectId }).sort({ order: 1 });
  return { columns, tasks };
};

export const createTask = async ({
  projectId,
  userId,
  title,
  description,
  statusColumnId,
  assigneeId,
  priority,
  tags,
  dueDate,
}) => {
  if (!title?.trim()) {
    throw appError(
      boardErrors.missingTitle.status,
      boardErrors.missingTitle.message
    );
  }
  const { role } = await ensureProjectAccess(projectId, userId);
  ensureBoardWriteAccess(role);
  const task = await BoardTask.create({
    projectId,
    title: title.trim(),
    description: description || "",
    statusColumnId,
    assigneeId,
    priority: priority || "medium",
    tags: tags || [],
    dueDate,
  });
  return task;
};

export const moveTask = async ({ taskId, userId, statusColumnId, order }) => {
  const task = await BoardTask.findById(taskId);
  if (!task) {
    throw appError(
      boardErrors.taskNotFound.status,
      boardErrors.taskNotFound.message
    );
  }
  const { role } = await ensureProjectAccess(task.projectId, userId);
  ensureBoardWriteAccess(role);
  const newStatusColumnId = statusColumnId || task.statusColumnId;
  task.statusColumnId = newStatusColumnId;
  task.order = typeof order === "number" ? order : task.order;
  await task.save();
  if (statusColumnId) {
    const column = await BoardColumn.findById(newStatusColumnId);
    if (column && column.name.toLowerCase() === "completed") {
      await updateStreakOnActivity(userId);
      await logActivity(userId, "board.task.completed", {
        taskId,
        projectId: task.projectId,
      });
    }
  }
  return task;
};

export const updateTask = async ({
  taskId,
  userId,
  title,
  description,
  priority,
  tags,
  dueDate,
  assigneeId,
}) => {
  const task = await BoardTask.findById(taskId);
  if (!task) {
    throw appError(
      boardErrors.taskNotFound.status,
      boardErrors.taskNotFound.message
    );
  }
  const { role } = await ensureProjectAccess(task.projectId, userId);
  ensureBoardWriteAccess(role);
  if (!title?.trim()) {
    throw appError(
      boardErrors.missingTitle.status,
      boardErrors.missingTitle.message
    );
  }
  task.title = title.trim();
  task.description = description || "";
  task.priority = priority || task.priority;
  task.tags = tags || [];
  task.dueDate = dueDate;
  task.assigneeId = assigneeId || task.assigneeId;
  await task.save();
  await logActivity(userId, "board.task.updated", { taskId });
  return task;
};

export const deleteTask = async ({ taskId, userId }) => {
  const task = await BoardTask.findById(taskId);
  if (!task) {
    throw appError(
      boardErrors.taskNotFound.status,
      boardErrors.taskNotFound.message
    );
  }
  const { role } = await ensureProjectAccess(task.projectId, userId);
  ensureBoardWriteAccess(role);
  await BoardTask.deleteOne({ _id: taskId });
};
