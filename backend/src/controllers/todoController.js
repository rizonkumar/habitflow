import {
  createTodo,
  deleteTodo,
  listTodos,
  toggleTodo,
  updateTodo,
} from "../services/todoService.js";
import { serializeTodo } from "../serializers/todoSerializer.js";

export const createTodoController = async (req, res, next) => {
  try {
    const todo = await createTodo({
      ...req.validated.body,
      ownerId: req.userId,
    });
    res.status(201).json({ todo: serializeTodo(todo) });
  } catch (error) {
    next(error);
  }
};

export const listTodosController = async (req, res, next) => {
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
};

export const updateTodoController = async (req, res, next) => {
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
};

export const toggleTodoController = async (req, res, next) => {
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
};

export const deleteTodoController = async (req, res, next) => {
  try {
    await deleteTodo({
      todoId: req.validated.params.todoId,
      ownerId: req.userId,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
