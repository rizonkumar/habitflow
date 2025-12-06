"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "../../../store/projects";
import { useBoardStore } from "../../../store/board";
import { useMembershipStore } from "../../../store/membership";
import type { BoardColumn, ProjectRole } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import {
  Plus,
  Layout,
  ChevronRight,
  FolderKanban,
  Columns,
  RefreshCw,
  FolderPlus,
  Settings,
  Crown,
  Edit3,
  Eye,
  ArrowLeft,
  Users,
} from "lucide-react";

const roleIcons: Record<
  ProjectRole,
  { icon: typeof Crown; color: string; label: string }
> = {
  admin: { icon: Crown, color: "text-(--warning)", label: "Admin" },
  editor: { icon: Edit3, color: "text-(--primary)", label: "Editor" },
  viewer: { icon: Eye, color: "text-(--muted)", label: "Viewer" },
};

const columnColors: Record<string, string> = {
  Todo: "bg-(--warning)",
  "In Progress": "bg-(--primary)",
  Done: "bg-(--success)",
  Backlog: "bg-(--muted)",
};

export default function BoardPage() {
  const router = useRouter();
  const { projects, fetchProjects, createProject } = useProjectStore();
  const { columns, tasks, fetchBoard, initBoard, createTask, moveTask } =
    useBoardStore();
  const { currentUserRole, fetchCurrentUserRole, members, fetchMembers } =
    useMembershipStore();
  const [projectId, setProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectSidebar, setShowProjectSidebar] = useState(false);

  const canEdit = currentUserRole === "admin" || currentUserRole === "editor";
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    fetchProjects("jira");
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
      fetchCurrentUserRole(projectId);
      fetchMembers(projectId);
      setShowProjectSidebar(true);
    }
  }, [projectId, fetchBoard, fetchCurrentUserRole, fetchMembers]);

  const tasksByColumn = (col: BoardColumn) =>
    tasks
      .filter((t) => t.statusColumnId === col.id)
      .sort((a, b) => a.order - b.order);

  const onCreate = async (targetColumnId: string) => {
    if (!title.trim() || !projectId) return;
    await createTask({
      projectId,
      title,
      statusColumnId: targetColumnId,
    });
    setTitle("");
    setShowAddTask(null);
  };

  const handleInitBoard = async () => {
    if (projectId) {
      await initBoard(projectId);
      fetchBoard(projectId);
    }
  };

  const getColumnColor = (name: string) =>
    columnColors[name] || "bg-(--accent)";
  const totalTasks = tasks.length;
  const selectedProject = projects.find((p) => p.id === projectId);

  const createBoardProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    const created = await createProject({ name, type: "jira" });
    setNewProjectName("");
    setShowNewProject(false);
    await fetchProjects("jira");
    setProjectId(created.id);
  };

  // Main sidebar - project list
  const mainSidebar = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Projects
          </h3>
          <button
            onClick={() => setShowNewProject((v) => !v)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-(--foreground) border border-(--border) hover:bg-(--card-hover)"
          >
            <FolderPlus size={14} /> New
          </button>
        </div>

        {showNewProject && (
          <div className="mb-2 flex items-center gap-2">
            <input
              className="flex-1 rounded-md border border-(--input-border) bg-(--input) px-2 py-1.5 text-sm text-(--foreground) outline-none focus:border-(--ring)"
              placeholder="New board project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createBoardProject();
                if (e.key === "Escape") setShowNewProject(false);
              }}
              autoFocus
            />
            <button
              className="rounded-md bg-(--primary) text-(--primary-foreground) text-xs px-3 py-1.5 hover:bg-(--primary-hover)"
              onClick={createBoardProject}
            >
              Create
            </button>
          </div>
        )}

        <nav className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setProjectId(project.id)}
              className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                projectId === project.id
                  ? "bg-(--primary)/10 text-(--primary)"
                  : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FolderKanban size={16} />
                {project.name}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Project-specific sidebar
  const projectSidebar = (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setShowProjectSidebar(false)}
        className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
      >
        <ArrowLeft size={16} />
        All Projects
      </button>

      {/* Project Info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderKanban size={18} className="text-(--primary)" />
          <h3 className="text-base font-semibold text-(--foreground) truncate">
            {selectedProject?.name}
          </h3>
        </div>
        {currentUserRole && (() => {
          const config = roleIcons[currentUserRole];
          const Icon = config.icon;
          return (
            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-(--secondary) ${config.color}`}>
              <Icon size={12} />
              {config.label}
            </span>
          );
        })()}
      </div>

      {/* Members Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Members
          </h3>
          <span className="text-xs text-(--muted)">{members.length}</span>
        </div>
        <div className="space-y-2">
          {members.slice(0, 5).map((member) => {
            const config = roleIcons[member.role];
            const Icon = config.icon;
            return (
              <div key={member.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary) text-xs font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-(--foreground) truncate max-w-[100px]">
                    {member.name}
                  </span>
                </div>
                <Icon size={14} className={config.color} />
              </div>
            );
          })}
          {members.length > 5 && (
            <p className="text-xs text-(--muted) pl-9">+{members.length - 5} more</p>
          )}
        </div>
      </div>

      {/* Columns */}
      {columns.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
            Columns
          </h3>
          <div className="space-y-1">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between px-3 py-1.5 text-sm text-(--muted)"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${getColumnColor(col.name)}`}
                  ></span>
                  {col.name}
                </span>
                <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">
                  {tasksByColumn(col).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Actions
        </h3>
        {columns.length === 0 && projectId && canEdit && (
          <button
            onClick={handleInitBoard}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-(--primary) bg-(--primary)/10 hover:bg-(--primary)/20 transition-colors"
          >
            <Columns size={16} />
            Initialize Board
          </button>
        )}
        <button
          onClick={() => projectId && fetchBoard(projectId)}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
        <button
          onClick={() => router.push(`/board/${projectId}/settings`)}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
        >
          <Settings size={16} />
          {isAdmin ? "Manage Members" : "View Members"}
        </button>
      </div>
    </div>
  );

  const sidebar = showProjectSidebar && projectId ? projectSidebar : mainSidebar;

  return (
    <AppShell sidebar={sidebar}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-(--foreground)">
              Board
            </h1>
            {currentUserRole &&
              (() => {
                const config = roleIcons[currentUserRole];
                const Icon = config.icon;
                return (
                  <span
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-(--secondary) ${config.color}`}
                  >
                    <Icon size={12} />
                    {config.label}
                  </span>
                );
              })()}
          </div>
          <p className="mt-1 text-sm text-(--muted)">
            {selectedProject
              ? `${selectedProject.name} • ${totalTasks} tasks`
              : "Select a project"}
          </p>
        </div>

        {columns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {columns.map((column) => {
              const columnTasks = tasksByColumn(column);
              return (
                <div
                  key={column.id}
                  className="flex flex-col rounded-xl border border-(--border) bg-(--card)"
                >
                  <div className="flex items-center justify-between p-4 border-b border-(--border)">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getColumnColor(
                          column.name
                        )}`}
                      />
                      <h3 className="text-sm font-semibold text-(--foreground)">
                        {column.name}
                      </h3>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-(--secondary) text-xs text-(--muted)">
                        {columnTasks.length}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddTask(
                            showAddTask === column.id ? null : column.id
                          )
                        }
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>

                  {showAddTask === column.id && (
                    <div className="p-3 border-b border-(--border) bg-(--secondary)/30">
                      <input
                        className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring)"
                        placeholder="Task title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onCreate(column.id);
                          if (e.key === "Escape") {
                            setShowAddTask(null);
                            setTitle("");
                          }
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => onCreate(column.id)}
                          disabled={!title.trim()}
                          className="flex-1 rounded-lg bg-(--primary) px-3 py-1.5 text-xs font-medium text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTask(null);
                            setTitle("");
                          }}
                          className="flex-1 rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-3 space-y-2 min-h-[200px]">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group rounded-lg border border-(--border) bg-(--background) p-3 transition-all hover:border-(--primary)/30 hover:shadow-sm"
                      >
                        <p className="text-sm font-medium text-(--foreground)">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-(--muted) mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {canEdit && (
                          <div className="mt-3 pt-2 border-t border-(--border) flex flex-wrap gap-1">
                            {columns
                              .filter((c) => c.id !== column.id)
                              .map((c) => (
                                <button
                                  key={c.id}
                                  className="flex items-center gap-1 text-xs text-(--muted) hover:text-(--primary) transition-colors"
                                  onClick={() =>
                                    moveTask({
                                      taskId: task.id,
                                      statusColumnId: c.id,
                                    })
                                  }
                                >
                                  <ChevronRight size={12} />
                                  {c.name}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {!columnTasks.length && showAddTask !== column.id && (
                      <div className="flex flex-col items-center justify-center h-32 text-center">
                        <p className="text-xs text-(--muted)">No tasks</p>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => setShowAddTask(column.id)}
                            className="mt-2 text-xs text-(--primary) hover:underline"
                          >
                            Add a task
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-(--border) border-dashed bg-(--card) p-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-(--accent)/10 text-(--accent)">
              <Layout size={24} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-(--foreground)">
              No board columns
            </h3>
            <p className="mt-1 text-sm text-(--muted)">
              Initialize the board to create default columns.
            </p>
            {projectId && (
              <button
                type="button"
                onClick={handleInitBoard}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
              >
                <Columns size={16} />
                Initialize Board
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
