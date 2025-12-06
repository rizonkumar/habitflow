import { create } from "zustand";
import { withToken } from "../lib/api";
import type { Streak } from "../types/api";
import { useAuthStore } from "./auth";

type StreakState = {
  streak: Streak | null;
  loading: boolean;
  error: string | null;
  fetchStreak: () => Promise<void>;
};

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  loading: false,
  error: null,

  fetchStreak: async () => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const data = await request<{ streak: Streak }>("/api/streaks/me", { method: "GET" });
      set({ streak: data.streak, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load streak";
      set({ error: message, loading: false });
    }
  },
}));

