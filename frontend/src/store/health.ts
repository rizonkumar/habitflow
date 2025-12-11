import { create } from "zustand";
import { withToken } from "../lib/api";
import type {
  HealthLog,
  HealthLogType,
  SleepQuality,
  MealType,
} from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type WaterPayload = {
  type: "water";
  glasses: number;
  milliliters?: number;
  date?: string;
};

type GymPayload = {
  type: "gym";
  workoutType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  notes?: string;
  date?: string;
};

type SleepPayload = {
  type: "sleep";
  bedtime: string;
  wakeTime: string;
  quality: SleepQuality;
  date?: string;
};

type DietPayload = {
  type: "diet";
  mealType: MealType;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  description?: string;
  date?: string;
};

type CustomPayload = {
  type: "custom";
  name: string;
  value: number;
  unit: string;
  date?: string;
};

export type CreateHealthLogPayload =
  | WaterPayload
  | GymPayload
  | SleepPayload
  | DietPayload
  | CustomPayload;

type HealthState = {
  logs: HealthLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: (params?: {
    type?: HealthLogType;
    from?: string;
    to?: string;
  }) => Promise<void>;
  createLog: (payload: CreateHealthLogPayload) => Promise<HealthLog>;
  updateLog: (payload: { logId: string } & Partial<Omit<CreateHealthLogPayload, "type">>) => Promise<HealthLog>;
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

  createLog: async (payload) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ log: HealthLog }>("/api/health", {
        method: "POST",
        body: payload,
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

  updateLog: async ({ logId, ...fields }) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ log: HealthLog }>(`/api/health/${logId}`, {
        method: "PUT",
        body: fields,
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
