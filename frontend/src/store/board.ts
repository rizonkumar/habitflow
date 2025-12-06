import { create } from "zustand";
import { withToken } from "../lib/api";
import type { BoardColumn, BoardTask } from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type BoardState = {
  columns: BoardColumn[];
  tasks: BoardTask[];
  loading: boolean;
  error: string | null;
  fetchBoard: (projectId: string) => Promise<void>;
  initBoard: (projectId: string) => Promise<void>;
  createTask: (payload: {
    projectId: string;
    title: string;
    description?: string;
    statusColumnId: string;
    assigneeId?: string;
    priority?: BoardTask["priority"];
    tags?: string[];
    dueDate?: string;
  }) => Promise<BoardTask>;
  moveTask: (payload: {
    taskId: string;
    statusColumnId?: string;
    order?: number;
  }) => Promise<BoardTask>;
  updateTask: (payload: {
    taskId: string;
    title: string;
    description?: string;
    priority?: BoardTask["priority"];
    tags?: string[];
    dueDate?: string;
    assigneeId?: string;
  }) => Promise<BoardTask>;
  deleteTask: (taskId: string) => Promise<void>;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  tasks: [],
  loading: false,
  error: null,

  fetchBoard: async (projectId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const data = await request<{ columns: BoardColumn[]; tasks: BoardTask[] }>(
        `/api/board/${projectId}`,
        { method: "GET" }
      );
      set({ columns: data.columns, tasks: data.tasks, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load board";
      set({ error: message, loading: false });
      useToastStore.getState().push({ message, type: "error" });
    }
  },

  initBoard: async (projectId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ columns: BoardColumn[] }>(
        `/api/board/${projectId}/init`,
        { method: "POST" }
      );
      set({ columns: data.columns });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to init board";
      useToastStore.getState().push({ message, type: "error" });
    }
  },

  createTask: async ({
    projectId,
    title,
    description,
    statusColumnId,
    assigneeId,
    priority,
    tags,
    dueDate,
  }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ task: BoardTask }>(
        `/api/board/${projectId}/tasks`,
        {
          method: "POST",
          body: { title, description, statusColumnId, assigneeId, priority, tags, dueDate },
        }
      );
      set({ tasks: [...get().tasks, data.task] });
      useToastStore.getState().push({ message: "Task created", type: "success" });
      return data.task;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create task";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  moveTask: async ({ taskId, statusColumnId, order }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ task: BoardTask }>(
        `/api/board/tasks/${taskId}/move`,
        {
          method: "POST",
          body: { statusColumnId, order },
        }
      );
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? data.task : t)),
      });
      return data.task;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to move task";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  updateTask: async ({
    taskId,
    title,
    description,
    priority,
    tags,
    dueDate,
    assigneeId,
  }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ task: BoardTask }>(
        `/api/board/tasks/${taskId}`,
        {
          method: "PUT",
          body: { title, description, priority, tags, dueDate, assigneeId },
        }
      );
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? data.task : t)),
      });
      useToastStore.getState().push({ message: "Task updated", type: "success" });
      return data.task;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update task";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      await request(`/api/board/tasks/${taskId}`, { method: "DELETE" });
      set({ tasks: get().tasks.filter((t) => t.id !== taskId) });
      useToastStore.getState().push({ message: "Task deleted", type: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete task";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },
}));

