"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMembershipStore } from "../../../../../store/membership";
import { useProjectStore } from "../../../../../store/projects";
import { useAuthStore } from "../../../../../store/auth";
import { AppShell, useSidebarCollapsed } from "../../../../../components/app/AppShell";
import { SidebarItem } from "../../../../../components/app/SidebarItem";
import type { ProjectRole } from "../../../../../types/api";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  Edit3,
  Eye,
  Trash2,
  Search,
  Loader2,
  Crown,
  FolderKanban,
} from "lucide-react";
import { useToastStore } from "@/components/ui/Toast";

const roleConfig: Record<
  ProjectRole,
  { label: string; icon: typeof Shield; color: string }
> = {
  admin: { label: "Admin", icon: Crown, color: "text-(--warning)" },
  editor: { label: "Editor", icon: Edit3, color: "text-(--primary)" },
  viewer: { label: "Viewer", icon: Eye, color: "text-(--muted)" },
};

function SettingsSidebar({
  project,
  currentUserRole,
  members,
  router,
}: {
  project: { name: string } | undefined;
  currentUserRole: ProjectRole | null;
  members: { userId: string }[];
  router: ReturnType<typeof useRouter>;
}) {
  const { isCollapsed } = useSidebarCollapsed();

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <SidebarItem
          icon={<ArrowLeft size={16} />}
          label="Back to Board"
          onClick={() => router.push("/board")}
        />
        <SidebarItem
          icon={<FolderKanban size={16} />}
          label={project?.name || "Project"}
          isActive
        />
        {currentUserRole && (
          <SidebarItem
            icon={(() => {
              const config = roleConfig[currentUserRole];
              const Icon = config.icon;
              return <Icon size={16} className={config.color} />;
            })()}
            label={roleConfig[currentUserRole].label}
          />
        )}
        <SidebarItem
          icon={<Users size={16} />}
          label={`${members.length} member(s)`}
          count={members.length}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push("/board")}
          className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Board
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Project
        </h3>
        <div className="px-3 py-2 rounded-lg bg-(--secondary)">
          <p className="text-sm font-medium text-(--foreground)">
            {project?.name || "Loading..."}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Your Role
        </h3>
        <div className="px-3 py-2 rounded-lg bg-(--secondary)">
          {currentUserRole && (
            <div className="flex items-center gap-2">
              {(() => {
                const config = roleConfig[currentUserRole];
                const Icon = config.icon;
                return (
                  <>
                    <Icon size={16} className={config.color} />
                    <span className="text-sm font-medium text-(--foreground)">
                      {config.label}
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Members
        </h3>
        <p className="text-sm text-(--muted) px-3">
          {members.length} member(s)
        </p>
      </div>
    </div>
  );
}

export default function BoardSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const {
    members,
    currentUserRole,
    loading,
    searchedUser,
    searchLoading,
    fetchMembers,
    fetchCurrentUserRole,
    addMember,
    updateMemberRole,
    removeMember,
    searchUserByEmail,
    clearSearchedUser,
  } = useMembershipStore();

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("viewer");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    fetchProjects("jira");
  }, [fetchProjects]);

  useEffect(() => {
    if (projectId) {
      fetchMembers(projectId);
      fetchCurrentUserRole(projectId);
    }
  }, [projectId, fetchMembers, fetchCurrentUserRole]);

  const handleSearch = () => {
    if (email.trim()) {
      searchUserByEmail(email.trim());
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) return;
    try {
      await addMember(projectId, email.trim(), selectedRole);
      setEmail("");
      setSelectedRole("viewer");
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to add member", type: "error" });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: ProjectRole) => {
    try {
      await updateMemberRole(projectId, memberId, newRole);
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to update member role", type: "error" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(projectId, memberId);
      setConfirmRemove(null);
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to remove member", type: "error" });
    }
  };

  const sidebar = (
    <SettingsSidebar
      project={project}
      currentUserRole={currentUserRole}
      members={members}
      router={router}
    />
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">
            Project Settings
          </h1>
          <p className="mt-1 text-sm text-(--muted)">
            Manage members and permissions
          </p>
        </div>

        {isAdmin && (
          <div className="rounded-xl border border-(--border) bg-(--card) p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={20} className="text-(--primary)" />
              <h2 className="text-lg font-semibold text-(--foreground)">
                Add Member
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearSearchedUser();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full rounded-lg border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring)"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!email.trim() || searchLoading}
                  className="flex items-center gap-2 rounded-lg bg-(--secondary) px-4 py-2.5 text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors disabled:opacity-50"
                >
                  {searchLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  Search
                </button>
              </div>

              {searchedUser && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-(--border) bg-(--secondary)/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) font-medium">
                      {searchedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">
                        {searchedUser.name}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {searchedUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as ProjectRole)
                      }
                      className="rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={handleAddMember}
                      className="rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {email.trim() && !searchLoading && searchedUser === null && (
                <p className="text-sm text-(--muted) px-1">
                  No user found with this email. They need to create an account
                  first.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-(--border) bg-(--card)">
          <div className="flex items-center gap-2 p-6 border-b border-(--border)">
            <Users size={20} className="text-(--primary)" />
            <h2 className="text-lg font-semibold text-(--foreground)">
              Members
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="animate-spin text-(--muted)" />
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {members.map((member) => {
                const config = roleConfig[member.role];
                const Icon = config.icon;
                const isCurrentUser = member.userId === user?.id;
                const canModify = isAdmin && !isCurrentUser;

                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-(--foreground)">
                            {member.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-(--secondary) text-(--muted)">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-(--muted)">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canModify ? (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.userId,
                                e.target.value as ProjectRole
                              )
                            }
                            className="rounded-lg border border-(--input-border) bg-(--input) px-3 py-1.5 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>

                          {confirmRemove === member.userId ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleRemoveMember(member.userId)
                                }
                                className="rounded-lg bg-(--destructive) px-3 py-1.5 text-xs font-medium text-(--destructive-foreground) hover:opacity-90 transition-opacity"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmRemove(null)}
                                className="rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemove(member.userId)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-(--muted) hover:text-(--destructive) hover:bg-(--destructive)/10 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--secondary)">
                          <Icon size={14} className={config.color} />
                          <span className="text-sm text-(--foreground)">
                            {config.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-6">
          <h3 className="text-sm font-semibold text-(--foreground) mb-4">
            Role Permissions
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Crown size={16} className="text-(--warning) mt-0.5" />
              <div>
                <p className="font-medium text-(--foreground)">Admin</p>
                <p className="text-(--muted)">
                  Full access: manage members, edit project, create/edit/delete
                  tasks and columns
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Edit3 size={16} className="text-(--primary) mt-0.5" />
              <div>
                <p className="font-medium text-(--foreground)">Editor</p>
                <p className="text-(--muted)">
                  Create, edit, move, and delete tasks. Cannot manage members or
                  project settings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye size={16} className="text-(--muted) mt-0.5" />
              <div>
                <p className="font-medium text-(--foreground)">Viewer</p>
                <p className="text-(--muted)">
                  Read-only access. Can view tasks and board but cannot make
                  changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}