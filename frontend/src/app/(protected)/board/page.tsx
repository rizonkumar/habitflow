"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Draggable, type DropResult } from "@hello-pangea/dnd";
import { StrictModeDroppable } from "../../../components/board/StrictModeDroppable";
import { useProjectStore } from "../../../store/projects";
import { useBoardStore } from "../../../store/board";
import { useMembershipStore } from "../../../store/membership";
import type { BoardColumn, BoardTask, ProjectRole } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import { TaskModal } from "../../../components/board/TaskModal";
import { MemberFilter } from "../../../components/board/MemberFilter";
import {
  Plus,
  Layout,
  FolderKanban,
  Columns,
  RefreshCw,
  FolderPlus,
  Settings,
  Crown,
  Edit3,
  Eye,
  ArrowLeft,
  GripVertical,
  LayoutGrid,
  Clock,
  Users,
  Target,
} from "lucide-react";
import { useToastStore } from "@/components/ui/Toast";

const roleIcons: Record<
  ProjectRole,
  { icon: typeof Crown; color: string; label: string; bgColor: string }
> = {
  admin: {
    icon: Crown,
    color: "text-amber-500",
    label: "Admin",
    bgColor: "bg-amber-500/10",
  },
  editor: {
    icon: Edit3,
    color: "text-blue-500",
    label: "Editor",
    bgColor: "bg-blue-500/10",
  },
  viewer: {
    icon: Eye,
    color: "text-slate-400",
    label: "Viewer",
    bgColor: "bg-slate-400/10",
  },
};

const columnColors: Record<
  string,
  { bg: string; border: string; gradient: string }
> = {
  Todo: {
    bg: "bg-amber-500",
    border: "border-amber-500/30",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  "In Progress": {
    bg: "bg-blue-500",
    border: "border-blue-500/30",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  Done: {
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/10 to-green-500/10",
  },
  Backlog: {
    bg: "bg-slate-400",
    border: "border-slate-400/30",
    gradient: "from-slate-400/10 to-gray-400/10",
  },
};

export default function BoardPage() {
  const router = useRouter();
  const { projects, fetchProjects, createProject } = useProjectStore();
  const {
    columns,
    tasks,
    fetchBoard,
    initBoard,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
  } = useBoardStore();
  const { currentUserRole, fetchCurrentUserRole, members, fetchMembers } =
    useMembershipStore();
  const [projectId, setProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectSidebar, setShowProjectSidebar] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [filterMemberIds, setFilterMemberIds] = useState<string[]>([]);

  const canEdit = currentUserRole === "admin" || currentUserRole === "editor";
  const isAdmin = currentUserRole === "admin";

  useEffect(() => {
    fetchProjects("jira");
  }, [fetchProjects]);

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
      fetchCurrentUserRole(projectId);
      fetchMembers(projectId);
      setShowProjectSidebar(true);
    }
  }, [projectId, fetchBoard, fetchCurrentUserRole, fetchMembers]);

  const filteredTasks =
    filterMemberIds.length > 0
      ? tasks.filter((t) => {
          if (filterMemberIds.includes("unassigned")) {
            return !t.assigneeId || filterMemberIds.includes(t.assigneeId);
          }
          return t.assigneeId && filterMemberIds.includes(t.assigneeId);
        })
      : tasks;

  const tasksByColumn = (col: BoardColumn) =>
    filteredTasks
      .filter((t) => t.statusColumnId === col.id)
      .sort((a, b) => a.order - b.order);

  const onCreate = async (targetColumnId: string) => {
    if (!title.trim() || !projectId) return;
    await createTask({
      projectId,
      title,
      statusColumnId: targetColumnId,
      assigneeId: assigneeId || undefined,
    });
    setTitle("");
    setAssigneeId("");
    setShowAddTask(null);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !canEdit) return;

    const { draggableId, destination } = result;
    const newColumnId = destination.droppableId;
    const newOrder = destination.index;

    try {
      await moveTask({
        taskId: draggableId,
        statusColumnId: newColumnId,
        order: newOrder,
      });
    } catch {
      useToastStore
        .getState()
        .push({ message: "Failed to move task", type: "error" });
    }
  };

  const toggleMemberFilter = (userId: string) => {
    setFilterMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const clearMemberFilter = () => setFilterMemberIds([]);

  const handleInitBoard = async () => {
    if (projectId) {
      await initBoard(projectId);
      fetchBoard(projectId);
    }
  };

  const getColumnColor = (name: string) =>
    columnColors[name] || {
      bg: "bg-(--accent)",
      border: "border-(--accent)/30",
      gradient: "from-(--accent)/10 to-(--accent)/5",
    };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getPriorityStyles = (priority: BoardTask["priority"]) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-gradient-to-r from-red-500/10 to-orange-500/10",
          text: "text-red-500",
          dot: "bg-red-500",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10",
          text: "text-amber-500",
          dot: "bg-amber-500",
        };
      case "low":
        return {
          bg: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
          text: "text-emerald-500",
          dot: "bg-emerald-500",
        };
      default:
        return {
          bg: "bg-(--secondary)",
          text: "text-(--muted)",
          dot: "bg-(--muted)",
        };
    }
  };

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

  const mainSidebar = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Projects
          </h3>
          <button
            onClick={() => setShowNewProject((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--foreground) border border-(--border) hover:bg-(--card-hover) hover:border-(--primary)/30 transition-all"
          >
            <FolderPlus size={14} /> New
          </button>
        </div>

        {showNewProject && (
          <div className="mb-3 flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createBoardProject();
                if (e.key === "Escape") setShowNewProject(false);
              }}
              autoFocus
            />
            <button
              className="rounded-lg bg-(--primary) text-(--primary-foreground) text-xs px-3 py-2 hover:bg-(--primary-hover) transition-colors"
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
              className={`flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                projectId === project.id
                  ? "bg-gradient-to-r from-(--primary)/15 to-(--primary)/5 text-(--primary) shadow-sm"
                  : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <FolderKanban size={16} />
                {project.name}
              </span>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="text-xs text-(--muted) text-center py-6 border border-dashed border-(--border) rounded-xl">
              No projects yet
            </div>
          )}
        </nav>
      </div>
    </div>
  );

  const projectSidebar = (
    <div className="space-y-6">
      <button
        onClick={() => {
          setProjectId("");
          setShowProjectSidebar(false);
        }}
        className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--foreground) transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        All Projects
      </button>

      <div className="p-4 rounded-xl bg-gradient-to-br from-(--primary)/10 to-(--accent)/5 border border-(--primary)/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-(--primary)/20 text-(--primary)">
            <FolderKanban size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-(--foreground) truncate">
              {selectedProject?.name}
            </h3>
            {currentUserRole &&
              (() => {
                const config = roleIcons[currentUserRole];
                const Icon = config.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} mt-1`}
                  >
                    <Icon size={10} />
                    {config.label}
                  </span>
                );
              })()}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-(--muted)">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {members.length} members
          </span>
          <span className="flex items-center gap-1">
            <Target size={12} />
            {tasks.length} tasks
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Members
          </h3>
          <span className="text-xs font-medium bg-(--secondary) px-2 py-0.5 rounded-full text-(--muted)">
            {members.length}
          </span>
        </div>
        <div className="space-y-2">
          {members.slice(0, 5).map((member) => {
            const config = roleIcons[member.role];
            const Icon = config.icon;
            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-(--card-hover) transition-colors"
                title={member.name}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-(--primary)/20 to-(--accent)/10 flex items-center justify-center text-(--primary) text-xs font-semibold">
                    {getInitials(member.name)}
                  </div>
                  <span className="text-sm text-(--foreground) truncate max-w-[100px]">
                    {member.name}
                  </span>
                </div>
                <span
                  className={`${config.bgColor} ${config.color} p-1.5 rounded-lg`}
                >
                  <Icon size={12} />
                </span>
              </div>
            );
          })}
          {members.length > 5 && (
            <p className="text-xs text-(--muted) text-center py-2">
              +{members.length - 5} more members
            </p>
          )}
        </div>
      </div>

      {columns.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3">
            Columns
          </h3>
          <div className="space-y-1.5">
            {columns.map((col) => {
              const colorConfig = getColumnColor(col.name);
              return (
                <div
                  key={col.id}
                  className="flex items-center justify-between px-3 py-2 text-sm text-(--foreground) rounded-lg hover:bg-(--card-hover) transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${colorConfig.bg}`}
                    ></span>
                    {col.name}
                  </span>
                  <span className="text-xs font-medium bg-(--secondary) px-2 py-0.5 rounded-full">
                    {tasksByColumn(col).length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3">
          Actions
        </h3>
        <div className="space-y-2">
          {columns.length === 0 && projectId && canEdit && (
            <button
              onClick={handleInitBoard}
              className="flex items-center gap-2.5 w-full rounded-xl px-4 py-3 text-sm font-medium text-(--primary-foreground) bg-gradient-to-r from-(--primary) to-blue-600 shadow-lg shadow-(--primary)/25 hover:shadow-xl hover:shadow-(--primary)/30 transition-all"
            >
              <Columns size={16} />
              Initialize Board
            </button>
          )}
          <button
            onClick={() => projectId && fetchBoard(projectId)}
            className="flex items-center gap-2.5 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-all"
          >
            <RefreshCw size={16} />
            Refresh Board
          </button>
          <button
            onClick={() => router.push(`/board/${projectId}/settings`)}
            className="flex items-center gap-2.5 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-all"
          >
            <Settings size={16} />
            {isAdmin ? "Manage Members" : "View Members"}
          </button>
        </div>
      </div>
    </div>
  );

  const sidebar =
    showProjectSidebar && projectId ? projectSidebar : mainSidebar;

  return (
    <AppShell sidebar={sidebar}>
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-(--primary)/20 to-(--accent)/20 text-(--primary)">
                <LayoutGrid size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-(--foreground) tracking-tight">
                    Board
                  </h1>
                  {currentUserRole &&
                    (() => {
                      const config = roleIcons[currentUserRole];
                      const Icon = config.icon;
                      return (
                        <span
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${config.bgColor} ${config.color}`}
                        >
                          <Icon size={12} />
                          {config.label}
                        </span>
                      );
                    })()}
                </div>
                <p className="text-sm text-(--muted)">
                  {selectedProject
                    ? `${selectedProject.name} • ${filteredTasks.length}${
                        filterMemberIds.length > 0 ? ` of ${tasks.length}` : ""
                      } tasks`
                    : "Select a project from the sidebar"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <MemberFilter
              members={members}
              selectedIds={filterMemberIds}
              onToggle={toggleMemberFilter}
              onClear={clearMemberFilter}
            />
          </div>
        </div>

        {columns.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {columns.map((column) => {
                const columnTasks = tasksByColumn(column);
                const colorConfig = getColumnColor(column.name);
                return (
                  <div
                    key={column.id}
                    className={`flex flex-col rounded-2xl border-2 ${colorConfig.border} bg-(--card) overflow-hidden transition-all hover:shadow-lg`}
                  >
                    <div
                      className={`flex items-center justify-between p-4 bg-gradient-to-r ${colorConfig.gradient}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3 h-3 rounded-full ${colorConfig.bg} shadow-sm`}
                        />
                        <h3 className="text-sm font-semibold text-(--foreground)">
                          {column.name}
                        </h3>
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--card) text-xs font-medium text-(--muted) shadow-sm">
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
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-(--card) text-(--muted) hover:text-(--primary) hover:shadow-md transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {showAddTask === column.id && (
                      <div className="p-4 border-b border-(--border) bg-(--secondary)/30">
                        <input
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                          placeholder="Task title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onCreate(column.id);
                            if (e.key === "Escape") {
                              setShowAddTask(null);
                              setTitle("");
                              setAssigneeId("");
                            }
                          }}
                        />
                        {members.length > 1 && (
                          <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full mt-3 rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                          >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                              <option key={member.userId} value={member.userId}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => onCreate(column.id)}
                            disabled={!title.trim()}
                            className="flex-1 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-4 py-2 text-sm font-medium text-(--primary-foreground) shadow-lg shadow-(--primary)/20 transition-all hover:shadow-xl disabled:opacity-50"
                          >
                            Add Task
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddTask(null);
                              setTitle("");
                              setAssigneeId("");
                            }}
                            className="flex-1 rounded-xl border border-(--border) px-4 py-2 text-sm font-medium text-(--foreground) hover:bg-(--card-hover) transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <StrictModeDroppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 space-y-3 min-h-[200px] transition-all ${
                            snapshot.isDraggingOver
                              ? `bg-gradient-to-b ${colorConfig.gradient}`
                              : ""
                          }`}
                        >
                          {columnTasks.map((task, index) => {
                            const taskAssignee = members.find(
                              (m) => m.userId === task.assigneeId
                            );
                            const priorityStyle = getPriorityStyles(
                              task.priority
                            );
                            return (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                                isDragDisabled={!canEdit}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    onClick={() => setSelectedTask(task)}
                                    className={`group rounded-xl border-2 bg-(--card) p-4 transition-all cursor-pointer ${
                                      snapshot.isDragging
                                        ? "shadow-2xl border-(--primary) scale-[1.02] rotate-1"
                                        : "border-(--border) hover:border-(--primary)/40 hover:shadow-lg hover:-translate-y-0.5"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {canEdit && (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="mt-0.5 text-(--muted) hover:text-(--foreground) cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <GripVertical size={14} />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-(--foreground) leading-relaxed">
                                          {task.title}
                                        </p>
                                        {task.description && (
                                          <p className="text-xs text-(--muted) mt-1.5 line-clamp-2">
                                            {task.description}
                                          </p>
                                        )}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-(--border)">
                                          <div className="flex items-center gap-2">
                                            {task.priority && (
                                              <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}
                                              >
                                                <span
                                                  className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`}
                                                ></span>
                                                {task.priority}
                                              </span>
                                            )}
                                            {task.dueDate && (
                                              <span className="inline-flex items-center gap-1 text-xs text-(--muted) px-2 py-0.5 rounded-full bg-(--secondary)">
                                                <Clock size={10} />
                                                {new Date(
                                                  task.dueDate
                                                ).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                })}
                                              </span>
                                            )}
                                          </div>
                                          {taskAssignee && (
                                            <div
                                              className="w-7 h-7 rounded-full bg-gradient-to-br from-(--primary)/20 to-(--accent)/10 flex items-center justify-center text-(--primary) text-[10px] font-semibold shadow-sm"
                                              title={taskAssignee.name}
                                            >
                                              {getInitials(taskAssignee.name)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {!columnTasks.length && showAddTask !== column.id && (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                              <div className="w-10 h-10 rounded-xl bg-(--secondary) flex items-center justify-center text-(--muted) mb-2">
                                <Layout size={18} />
                              </div>
                              <p className="text-xs text-(--muted)">No tasks</p>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => setShowAddTask(column.id)}
                                  className="mt-2 text-xs font-medium text-(--primary) hover:underline"
                                >
                                  Add a task
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-(--border) bg-(--card) p-12 sm:p-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-(--primary)/20 to-(--accent)/20 text-(--primary)">
              {projectId ? <Layout size={28} /> : <FolderKanban size={28} />}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-(--foreground)">
              {projectId ? "No board columns" : "No project selected"}
            </h3>
            <p className="mt-2 text-sm text-(--muted) max-w-md mx-auto">
              {projectId
                ? "Initialize the board to create default columns and start organizing your tasks."
                : "Select a project from the sidebar to view its board and manage tasks."}
            </p>
            {projectId && canEdit && (
              <button
                type="button"
                onClick={handleInitBoard}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-6 py-3 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02]"
              >
                <Columns size={18} />
                Initialize Board
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          canEdit={canEdit}
          onSave={async (data) => {
            await updateTask({
              taskId: selectedTask.id,
              ...data,
            });
          }}
          onDelete={async () => {
            await deleteTask(selectedTask.id);
          }}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </AppShell>
  );
}
