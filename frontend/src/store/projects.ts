import { create } from "zustand";
import { withToken } from "../lib/api";
import type { Project } from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type ProjectState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: (type?: Project["type"]) => Promise<void>;
  createProject: (payload: {
    name: string;
    description?: string;
    type?: Project["type"];
  }) => Promise<Project>;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async (type) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const data = await request<{ projects: Project[] }>("/api/projects", {
        method: "GET",
        body: undefined,
      });
      const filtered = type
        ? data.projects.filter((p) => p.type === type)
        : data.projects;
      set({ projects: filtered, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load projects";
      set({ error: message, loading: false });
      useToastStore.getState().push({ message, type: "error" });
    }
  },

  createProject: async ({ name, description, type }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ project: Project }>("/api/projects", {
        method: "POST",
        body: { name, description, type },
      });
      const next = [...get().projects, data.project];
      set({ projects: next });
      useToastStore
        .getState()
        .push({ message: "Project created", type: "success" });
      return data.project;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create project";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },
}));
