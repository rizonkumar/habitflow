import { Todo } from "../models/todoModel.js";
import { Project } from "../models/projectModel.js";
import { appError } from "../errors/appError.js";
import { todoErrors } from "../constants/todoConstants.js";
import { projectErrors } from "../constants/projectConstants.js";
import { updateStreakOnActivity } from "./streakService.js";
import { logActivity } from "./activityService.js";

const ensureProjectAccess = async (projectId, userId) => {
  if (!projectId) return null; // unassigned todo (Inbox)
  const project = await Project.findById(projectId);
  if (!project) {
    throw appError(
      projectErrors.notFound.status,
      projectErrors.notFound.message
    );
  }
  const isOwner = project.ownerId.toString() === userId;
  const isMember = project.members.some((m) => m.userId.toString() === userId);
  if (!isOwner && !isMember) {
    throw appError(todoErrors.forbidden.status, todoErrors.forbidden.message);
  }
  return project;
};

export const createTodo = async ({
  title,
  description,
  projectId,
  ownerId,
  dueDate,
  priority,
  tags,
}) => {
  if (!title?.trim()) {
    throw appError(
      todoErrors.missingTitle.status,
      todoErrors.missingTitle.message
    );
  }
  await ensureProjectAccess(projectId, ownerId);
  const todo = await Todo.create({
    title: title.trim(),
    description: description || "",
    projectId: projectId || null,
    ownerId,
    dueDate,
    priority: priority || "medium",
    tags: tags || [],
  });
  return todo;
};

export const listTodos = async ({ projectId, ownerId, status, from, to }) => {
  await ensureProjectAccess(projectId, ownerId);
  const criteria = { ownerId };
  if (projectId) criteria.projectId = projectId;
  if (status) criteria.status = status;

  if (from || to) {
    criteria.dueDate = {};
    if (from) {
      criteria.dueDate.$gte = new Date(`${from}T00:00:00.000Z`);
    }
    if (to) {
      criteria.dueDate.$lte = new Date(`${to}T23:59:59.999Z`);
    }
  }

  return Todo.find(criteria).sort({ createdAt: -1 });
};

export const updateTodo = async ({
  todoId,
  ownerId,
  title,
  description,
  dueDate,
  priority,
  tags,
}) => {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw appError(todoErrors.notFound.status, todoErrors.notFound.message);
  }
  if (todo.projectId) {
    await ensureProjectAccess(todo.projectId, ownerId);
  } else if (todo.ownerId.toString() !== ownerId) {
    throw appError(todoErrors.forbidden.status, todoErrors.forbidden.message);
  }

  if (!title?.trim()) {
    throw appError(
      todoErrors.missingTitle.status,
      todoErrors.missingTitle.message
    );
  }

  todo.title = title.trim();
  todo.description = description || "";
  todo.dueDate = dueDate;
  todo.priority = priority || todo.priority;
  todo.tags = tags || [];
  await todo.save();
  return todo;
};

export const toggleTodo = async ({ todoId, ownerId, status }) => {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw appError(todoErrors.notFound.status, todoErrors.notFound.message);
  }
  if (todo.projectId) {
    await ensureProjectAccess(todo.projectId, ownerId);
  } else if (todo.ownerId.toString() !== ownerId) {
    throw appError(todoErrors.forbidden.status, todoErrors.forbidden.message);
  }

  todo.status = status || (todo.status === "todo" ? "completed" : "todo");
  todo.completedAt = todo.status === "completed" ? new Date() : undefined;
  await todo.save();
  if (todo.status === "completed") {
    await updateStreakOnActivity(ownerId);
    await logActivity(ownerId, "todo.completed", { todoId });
  }
  return todo;
};

export const deleteTodo = async ({ todoId, ownerId }) => {
  const todo = await Todo.findById(todoId);
  if (!todo) {
    throw appError(todoErrors.notFound.status, todoErrors.notFound.message);
  }
  if (todo.projectId) {
    await ensureProjectAccess(todo.projectId, ownerId);
  } else if (todo.ownerId.toString() !== ownerId) {
    throw appError(todoErrors.forbidden.status, todoErrors.forbidden.message);
  }
  await Todo.deleteOne({ _id: todoId });
};
