import { create } from "zustand";
import { withToken } from "../lib/api";
import type { Todo } from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type TodoState = {
  items: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: (projectId: string, status?: Todo["status"]) => Promise<void>;
  addTodo: (payload: {
    projectId: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: Todo["priority"];
    tags?: string[];
  }) => Promise<Todo>;
  updateTodo: (payload: {
    todoId: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: Todo["priority"];
    tags?: string[];
  }) => Promise<Todo>;
  toggleTodo: (todoId: string, status?: Todo["status"]) => Promise<Todo>;
  deleteTodo: (todoId: string) => Promise<void>;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchTodos: async (projectId, status) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ projectId });
      if (status) params.append("status", status);
      const data = await request<{ todos: Todo[] }>(
        `/api/todos?${params.toString()}`,
        { method: "GET" }
      );
      set({ items: data.todos, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load todos";
      set({ error: message, loading: false });
      useToastStore.getState().push({ message, type: "error" });
    }
  },

  addTodo: async ({
    projectId,
    title,
    description,
    dueDate,
    priority,
    tags,
  }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ todo: Todo }>("/api/todos", {
        method: "POST",
        body: { projectId, title, description, dueDate, priority, tags },
      });
      set({ items: [...get().items, data.todo] });
      useToastStore.getState().push({ message: "Todo added", type: "success" });
      return data.todo;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add todo";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  updateTodo: async ({
    todoId,
    title,
    description,
    dueDate,
    priority,
    tags,
  }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ todo: Todo }>(`/api/todos/${todoId}`, {
        method: "PUT",
        body: { title, description, dueDate, priority, tags },
      });
      set({
        items: get().items.map((t) => (t.id === todoId ? data.todo : t)),
      });
      useToastStore
        .getState()
        .push({ message: "Todo updated", type: "success" });
      return data.todo;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update todo";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  toggleTodo: async (todoId, status) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ todo: Todo }>(
        `/api/todos/${todoId}/toggle`,
        {
          method: "POST",
          body: { status },
        }
      );
      set({
        items: get().items.map((t) => (t.id === todoId ? data.todo : t)),
      });
      return data.todo;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to toggle todo";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  deleteTodo: async (todoId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      await request(`/api/todos/${todoId}`, { method: "DELETE" });
      set({ items: get().items.filter((t) => t.id !== todoId) });
      useToastStore
        .getState()
        .push({ message: "Todo deleted", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete todo";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },
}));
