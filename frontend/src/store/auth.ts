import { create } from "zustand";
import { apiRequest } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  status: "idle",
  error: null,

  login: async ({ email, password }) => {
    set({ status: "loading", error: null });
    try {
      const data = await apiRequest<{ user: User; token: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: { email, password },
        }
      );
      set({ user: data.user, token: data.token, status: "authenticated" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      set({ error: message, status: "error" });
      throw error;
    }
  },

  signup: async ({ name, email, password }) => {
    set({ status: "loading", error: null });
    try {
      const data = await apiRequest<{ user: User; token: string }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: { name, email, password },
        }
      );
      set({ user: data.user, token: data.token, status: "authenticated" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      set({ error: message, status: "error" });
      throw error;
    }
  },

  refresh: async () => {
    try {
      const data = await apiRequest<{ user: User; token: string }>(
        "/api/auth/refresh",
        { method: "POST" }
      );
      set({
        user: data.user,
        token: data.token,
        status: "authenticated",
        error: null,
      });
    } catch {
      set({ user: null, token: null, status: "idle" });
    }
  },

  loadCurrentUser: async () => {
    if (!get().token) {
      await get().refresh();
    }
    const token = get().token;
    if (!token) {
      set({ user: null, status: "idle" });
      return;
    }
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/me", { token });
      set({ user: data.user, status: "authenticated" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Session expired";
      set({
        user: null,
        token: null,
        status: "idle",
        error: message,
      });
    }
  },

  logout: async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        token: get().token,
      });
    } catch (error) {
      console.error(error);
      set({ user: null, token: null, status: "idle", error: null });
      throw error;
    }
  },
}));
