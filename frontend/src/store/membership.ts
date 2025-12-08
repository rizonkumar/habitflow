import { create } from "zustand";
import { withToken } from "../lib/api";
import type { ProjectMember, ProjectRole } from "../types/api";
import { useAuthStore } from "./auth";
import { useToastStore } from "../components/ui/Toast";

type SearchedUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
} | null;

type MembershipState = {
  members: ProjectMember[];
  currentUserRole: ProjectRole | null;
  loading: boolean;
  error: string | null;
  searchedUser: SearchedUser;
  searchLoading: boolean;

  fetchMembers: (projectId: string) => Promise<void>;
  fetchCurrentUserRole: (projectId: string) => Promise<void>;
  addMember: (
    projectId: string,
    email: string,
    role?: ProjectRole
  ) => Promise<void>;
  updateMemberRole: (
    projectId: string,
    memberId: string,
    role: ProjectRole
  ) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;
  searchUserByEmail: (email: string) => Promise<void>;
  clearSearchedUser: () => void;
  reset: () => void;
};

export const useMembershipStore = create<MembershipState>((set, get) => ({
  members: [],
  currentUserRole: null,
  loading: false,
  error: null,
  searchedUser: null,
  searchLoading: false,

  fetchMembers: async (projectId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ loading: true, error: null });
    try {
      const data = await request<{ members: ProjectMember[] }>(
        `/api/projects/${projectId}/members`,
        { method: "GET" }
      );
      set({ members: data.members, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load members";
      set({ error: message, loading: false });
    }
  },

  fetchCurrentUserRole: async (projectId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ role: ProjectRole | null }>(
        `/api/projects/${projectId}/role`,
        { method: "GET" }
      );
      set({ currentUserRole: data.role });
    } catch {
      set({ currentUserRole: null });
    }
  },

  addMember: async (projectId, email, role = "viewer") => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ member: ProjectMember }>(
        `/api/projects/${projectId}/members`,
        { method: "POST", body: { email, role } }
      );
      set({ members: [...get().members, data.member], searchedUser: null });
      useToastStore
        .getState()
        .push({ message: "Member added", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add member";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  updateMemberRole: async (projectId, memberId, role) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      const data = await request<{ member: ProjectMember }>(
        `/api/projects/${projectId}/members/${memberId}`,
        { method: "PATCH", body: { role } }
      );
      set({
        members: get().members.map((m) =>
          m.userId === memberId ? data.member : m
        ),
      });
      useToastStore
        .getState()
        .push({ message: "Role updated", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update role";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  removeMember: async (projectId, memberId) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    try {
      await request(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });
      set({ members: get().members.filter((m) => m.userId !== memberId) });
      useToastStore
        .getState()
        .push({ message: "Member removed", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove member";
      useToastStore.getState().push({ message, type: "error" });
      throw error;
    }
  },

  searchUserByEmail: async (email) => {
    const token = useAuthStore.getState().token;
    const request = withToken(token);
    set({ searchLoading: true });
    try {
      const data = await request<{ user: SearchedUser }>(
        `/api/auth/users/search?email=${encodeURIComponent(email)}`,
        { method: "GET" }
      );
      set({ searchedUser: data.user, searchLoading: false });
    } catch {
      set({ searchedUser: null, searchLoading: false });
    }
  },

  clearSearchedUser: () => set({ searchedUser: null }),

  reset: () =>
    set({
      members: [],
      currentUserRole: null,
      loading: false,
      error: null,
      searchedUser: null,
      searchLoading: false,
    }),
}));
