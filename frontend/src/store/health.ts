import { create } from "zustand";
import { withToken } from "../lib/api";
import type { HealthLog } from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type HealthState = {
  logs: HealthLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: (params?: {
    type?: HealthLog["type"];
    from?: string;
    to?: string;
  }) => Promise<void>;
  createLog: (payload: {
    type: HealthLog["type"];
    amount?: number;
    unit?: string;
    metadata?: Record<string, any>;
    date?: string;
  }) => Promise<HealthLog>;
  updateLog: (payload: {
    logId: string;
    amount?: number;
    unit?: string;
    metadata?: Record<string, any>;
    date?: string;
  }) => Promise<HealthLog>;
  deleteLog: (logId: string) => Promise<void>;
};

export const useHealthStore = create<HealthState>((set, get) => ({
  logs: [],
  loading: false,
  error: null,

  fetchLogs: async (params) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const qs = new URLSearchParams();
      if (params?.type) qs.append("type", params.type);
      if (params?.from) qs.append("from", params.from);
      if (params?.to) qs.append("to", params.to);
      const data = await request<{ logs: HealthLog[] }>(
        `/api/health${qs.toString() ? `?${qs.toString()}` : ""}`,
        { method: "GET" }
      );
      set({ logs: data.logs, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load logs";
      set({ error: message, loading: false });
      useToastStore.getState().push({ message, type: "error" });
    }
  },

  createLog: async ({ type, amount, unit, metadata, date }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ log: HealthLog }>("/api/health", {
        method: "POST",
        body: { type, amount, unit, metadata, date },
      });
      set({ logs: [data.log, ...get().logs] });
      useToastStore.getState().push({ message: "Log added", type: "success" });
      return data.log;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add log";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  updateLog: async ({ logId, amount, unit, metadata, date }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ log: HealthLog }>(`/api/health/${logId}`, {
        method: "PUT",
        body: { amount, unit, metadata, date },
      });
      set({
        logs: get().logs.map((l) => (l.id === logId ? data.log : l)),
      });
      useToastStore
        .getState()
        .push({ message: "Log updated", type: "success" });
      return data.log;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update log";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  deleteLog: async (logId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      await request(`/api/health/${logId}`, { method: "DELETE" });
      set({ logs: get().logs.filter((l) => l.id !== logId) });
      useToastStore
        .getState()
        .push({ message: "Log deleted", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete log";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },
}));
