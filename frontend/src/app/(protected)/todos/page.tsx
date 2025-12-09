"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { useProjectStore } from "../../../store/projects";
import { useTodoStore } from "../../../store/todos";
import type { Todo } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import { useSidebarCollapsed } from "../../../components/app/AppShell";
import {
  SidebarItem,
  SidebarSection,
  SidebarButton,
  SidebarInput,
} from "../../../components/app/SidebarItem";
import { Skeleton } from "../../../components/ui/Skeleton";
import { DatePicker } from "../../../components/ui/DatePicker";
import { Select, type SelectOption } from "../../../components/ui/Select";
import {
  Plus,
  CheckSquare,
  CheckCircle2,
  Pencil,
  X,
  Check,
  RotateCcw,
  Search,
  Calendar,
  CalendarDays,
  FolderPlus,
  FolderKanban,
  Inbox as InboxIcon,
  Flag,
  Bell,
  Sparkles,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react";

type FilterType = "all" | "inbox" | "today" | "upcoming" | "completed";
type ViewMode = "list" | "grid";

// Helper to safely parse and format dates
const formatDueDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  try {
    // Handle ISO strings and date-only strings
    const date = dateStr.includes("T")
      ? parseISO(dateStr)
      : new Date(dateStr + "T00:00:00");
    if (!isValid(date)) return null;
    return format(date, "MMM d");
  } catch {
    return null;
  }
};

const parseDueDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    const date = dateStr.includes("T")
      ? parseISO(dateStr)
      : new Date(dateStr + "T00:00:00");
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

export default function TodosPage() {
  const { projects, fetchProjects, createProject } = useProjectStore();
  const { items, fetchTodos, addTodo, toggleTodo, updateTodo, loading } =
    useTodoStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPriority, setEditingPriority] = useState<
    Todo["priority"] | null
  >(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [chosenProjectId, setChosenProjectId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mDueDate, setMDueDate] = useState<Date | undefined>(undefined);
  const [mPriority, setMPriority] = useState<Todo["priority"]>("medium");
  const [mProjectId, setMProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects("todo");
  }, [fetchProjects]);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const status = filterType === "completed" ? "completed" : undefined;
    let from: string | undefined;
    let to: string | undefined;

    if (filterType === "today") {
      const todayStr = getTodayStr();
      from = todayStr;
      to = todayStr;
    }

    if (selectedProject) {
      fetchTodos(selectedProject, status, from, to);
    } else {
      fetchTodos(undefined, status, from, to);
    }
  }, [selectedProject, filterType, fetchTodos]);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      const el = document.getElementById(
        "new-todo-input"
      ) as HTMLInputElement | null;
      el?.focus();
    }
  }, [searchParams]);

  const filteredTodos = useMemo(() => {
    let result = items;

    if (selectedProject) {
      result = result.filter((t) => t.projectId === selectedProject);
    } else if (filterType === "inbox") {
      result = result.filter((t) => !t.projectId);
    }

    if (filterType === "completed") {
      result = result.filter((t) => t.status === "completed");
    } else if (filterType === "today") {
      result = result.filter((t) => t.status === "todo");
    } else if (filterType === "upcoming") {
      const now = new Date();
      result = result.filter((t) => {
        if (t.status !== "todo" || !t.dueDate) return false;
        const parsed = parseDueDate(t.dueDate);
        return parsed && parsed > now;
      });
    } else if (filterType === "all" && !selectedProject) {
      result = result.filter((t) => t.status === "todo");
    }

    if (searchQuery) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [items, selectedProject, filterType, searchQuery]);

  const todoCount = items.filter((t) => t.status === "todo").length;
  const inboxCount = items.filter(
    (t) => t.status === "todo" && !t.projectId
  ).length;
  const completedCount = items.filter((t) => t.status === "completed").length;

  const priorityOptions: SelectOption[] = [
    { value: "high", label: "High", color: "var(--destructive)" },
    { value: "medium", label: "Medium", color: "var(--warning)" },
    { value: "low", label: "Low", color: "var(--muted)" },
  ];

  const projectOptions: SelectOption[] = [
    {
      value: "none",
      label: "No project",
      icon: <InboxIcon size={15} className="text-(--muted)" />,
    },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: <FolderKanban size={15} className="text-(--primary)" />,
    })),
  ];

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo({
      projectId: chosenProjectId || selectedProject || undefined,
      title,
      priority,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
    });
    setTitle("");
    setPriority("medium");
    setDueDate(undefined);
    setChosenProjectId(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingPriority(todo.priority);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingPriority(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editingTitle.trim() || !editingPriority) return;
    await updateTodo({
      todoId: editingId,
      title: editingTitle,
      description: undefined,
      dueDate: undefined,
      priority: editingPriority,
      tags: undefined,
    });
    setEditingId(null);
    setEditingTitle("");
    setEditingPriority(null);
  };

  const createTodoProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    const created = await createProject({ name, type: "todo" });
    setNewProjectName("");
    setShowNewProject(false);
    await fetchProjects("todo");
    setSelectedProject(created.id);
  };

  const getPriorityStyles = (priority: Todo["priority"]) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-gradient-to-r from-red-500/10 to-orange-500/10",
          border: "border-red-500/30",
          text: "text-red-500",
          dot: "bg-red-500",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10",
          border: "border-amber-500/30",
          text: "text-amber-500",
          dot: "bg-amber-500",
        };
      case "low":
        return {
          bg: "bg-gradient-to-r from-slate-500/10 to-gray-500/10",
          border: "border-slate-500/30",
          text: "text-slate-400",
          dot: "bg-slate-400",
        };
    }
  };

  const sidebar = <TodoSidebar
    todoCount={todoCount}
    inboxCount={inboxCount}
    completedCount={completedCount}
    filterType={filterType}
    setFilterType={setFilterType}
    selectedProject={selectedProject}
    setSelectedProject={setSelectedProject}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    setShowAddModal={setShowAddModal}
    showNewProject={showNewProject}
    setShowNewProject={setShowNewProject}
    newProjectName={newProjectName}
    setNewProjectName={setNewProjectName}
    createTodoProject={createTodoProject}
    projects={projects}
  />;

  return (
    <AppShell sidebar={sidebar}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-(--primary)/20 to-(--accent)/20 text-(--primary)">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--foreground) tracking-tight">
                  Todos
                </h1>
                <p className="text-sm text-(--muted)">
                  {selectedProject
                    ? `Project: ${
                        projects.find((p) => p.id === selectedProject)?.name ??
                        "Unknown"
                      }`
                    : filterType === "all"
                    ? "All tasks"
                    : filterType === "inbox"
                    ? "No Project"
                    : filterType === "today"
                    ? "Tasks for today"
                    : filterType === "upcoming"
                    ? "Upcoming tasks"
                    : "Completed tasks"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-(--secondary)">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-(--card) text-(--foreground) shadow-sm"
                  : "text-(--muted) hover:text-(--foreground)"
              }`}
            >
              <List size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-(--card) text-(--foreground) shadow-sm"
                  : "text-(--muted) hover:text-(--foreground)"
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={onAdd}
          className={`rounded-2xl border-2 transition-all ${
            composerOpen
              ? "border-(--primary)/50 shadow-xl shadow-(--primary)/5 bg-(--card)"
              : "border-(--border) bg-(--card) hover:border-(--primary)/30"
          } p-4 sm:p-5`}
        >
          <div className="relative mb-4">
            <input
              id="new-todo-input"
              className="w-full rounded-xl border-0 bg-(--secondary)/50 pl-11 pr-4 py-3.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:bg-(--secondary) focus:ring-2 focus:ring-(--ring)/20"
              placeholder="What needs to be done?"
              value={title}
              onFocus={() => setComposerOpen(true)}
              onChange={(e) => setTitle(e.target.value)}
            />
            <CheckSquare
              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)"
              size={18}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="Due date"
            />

            <Select
              value={priority}
              onChange={(val) =>
                setPriority((val as Todo["priority"]) || "medium")
              }
              options={priorityOptions}
              placeholder="Priority"
              icon={<Flag size={15} />}
            />

            <Select
              value={chosenProjectId || selectedProject || "none"}
              onChange={(val) =>
                setChosenProjectId(val === "none" ? null : val)
              }
              options={projectOptions}
              placeholder="Project"
              icon={<FolderKanban size={15} />}
            />

            <button
              type="button"
              disabled
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-(--border) px-3 py-2 text-sm font-medium text-(--muted) opacity-50 cursor-not-allowed"
            >
              <Bell size={15} />
              Reminders
            </button>

            <div className="flex-1" />

            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add task</span>
            </button>
          </div>
        </form>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-(--border) bg-(--card) p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </div>
              </div>
            ))
          ) : filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => {
              const priorityStyle = getPriorityStyles(todo.priority);
              return (
                <div
                  key={todo.id}
                  className={`group rounded-2xl border-2 bg-(--card) p-4 transition-all hover:shadow-lg ${
                    todo.status === "completed"
                      ? "border-(--border) opacity-60"
                      : `${priorityStyle.border} hover:shadow-xl hover:shadow-(--primary)/5 hover:-translate-y-0.5`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleTodo(
                          todo.id,
                          todo.status === "todo" ? "completed" : "todo"
                        )
                      }
                      className={`flex items-center justify-center w-6 h-6 mt-0.5 rounded-full border-2 transition-all ${
                        todo.status === "completed"
                          ? "bg-(--success) border-(--success) text-white"
                          : `border-current ${priorityStyle.text} hover:bg-current/10`
                      }`}
                    >
                      <Check
                        size={14}
                        className={
                          todo.status === "completed"
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-50"
                        }
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <>
                          <input
                            className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            autoFocus
                          />
                          <div className="mt-2">
                            <select
                              value={editingPriority ?? todo.priority}
                              onChange={(e) =>
                                setEditingPriority(
                                  e.target.value as Todo["priority"]
                                )
                              }
                              className="w-fit rounded-lg border border-(--input-border) bg-(--input) px-3 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--ring)"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <p
                            className={`text-sm font-medium leading-relaxed ${
                              todo.status === "completed"
                                ? "text-(--muted) line-through"
                                : "text-(--foreground)"
                            }`}
                          >
                            {todo.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`}
                              ></span>
                              {todo.priority}
                            </span>
                            {formatDueDate(todo.dueDate) && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-(--muted) px-2.5 py-1 rounded-full bg-(--secondary)">
                                <Clock size={12} />
                                {formatDueDate(todo.dueDate)}
                              </span>
                            )}
                            {todo.projectId && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-(--primary) px-2.5 py-1 rounded-full bg-(--primary)/10">
                                <FolderKanban size={12} />
                                {
                                  projects.find((p) => p.id === todo.projectId)
                                    ?.name
                                }
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === todo.id ? (
                        <>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-(--success) hover:bg-(--success)/10 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-(--muted) hover:bg-(--card-hover) transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(todo)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          {todo.status === "completed" && (
                            <button
                              type="button"
                              onClick={() => toggleTodo(todo.id, "todo")}
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className={`${
                viewMode === "grid" ? "col-span-full" : ""
              } rounded-2xl border-2 border-dashed border-(--border) bg-(--card) p-12 text-center`}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-(--success)/20 to-(--primary)/20 text-(--success)">
                <CheckSquare size={28} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-(--foreground)">
                {filterType === "all"
                  ? "No todos yet"
                  : `No ${filterType} todos`}
              </h3>
              <p className="mt-2 text-sm text-(--muted) max-w-sm mx-auto">
                {filterType === "all"
                  ? "Add your first todo to get started. Stay organized and productive!"
                  : "Switch filters to see other todos or create a new one."}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02]"
              >
                <Plus size={16} />
                Add your first task
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-(--border) bg-(--card) shadow-2xl animate-in">
            <div className="flex items-center justify-between p-5 border-b border-(--border)">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-(--primary)/20 to-(--accent)/20 text-(--primary)">
                  <Plus size={20} />
                </div>
                <h2 className="text-lg font-semibold text-(--foreground)">
                  Add new task
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-2">
                  Task name
                </label>
                <input
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-3 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <DatePicker
                  value={mDueDate}
                  onChange={setMDueDate}
                  placeholder="Due date"
                />
                <Select
                  value={mPriority}
                  onChange={(val) =>
                    setMPriority((val as Todo["priority"]) || "medium")
                  }
                  options={priorityOptions}
                  placeholder="Priority"
                  icon={<Flag size={15} />}
                />
                <Select
                  value={mProjectId || selectedProject || "none"}
                  onChange={(val) => setMProjectId(val === "none" ? null : val)}
                  options={projectOptions}
                  placeholder="Project"
                  icon={<FolderKanban size={15} />}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-(--border) bg-(--secondary)/30 rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium hover:bg-(--card-hover) transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!mTitle.trim()) return;
                  await addTodo({
                    projectId: mProjectId || selectedProject || undefined,
                    title: mTitle,
                    dueDate: mDueDate
                      ? format(mDueDate, "yyyy-MM-dd")
                      : undefined,
                    priority: mPriority,
                  });
                  setMTitle("");
                  setMDueDate(undefined);
                  setMPriority("medium");
                  setMProjectId(null);
                  setShowAddModal(false);
                }}
                disabled={!mTitle.trim()}
                className="rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add task
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function TodoSidebar({
  todoCount,
  inboxCount,
  completedCount,
  filterType,
  setFilterType,
  selectedProject,
  setSelectedProject,
  searchQuery,
  setSearchQuery,
  setShowAddModal,
  showNewProject,
  setShowNewProject,
  newProjectName,
  setNewProjectName,
  createTodoProject,
  projects,
}: {
  todoCount: number;
  inboxCount: number;
  completedCount: number;
  filterType: FilterType;
  setFilterType: (f: FilterType) => void;
  selectedProject: string | null;
  setSelectedProject: (p: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setShowAddModal: (v: boolean) => void;
  showNewProject: boolean;
  setShowNewProject: (v: boolean) => void;
  newProjectName: string;
  setNewProjectName: (v: string) => void;
  createTodoProject: () => void;
  projects: { id: string; name: string }[];
}) {
  const { isCollapsed } = useSidebarCollapsed();

  return (
    <div className="space-y-6">
      <SidebarButton
        icon={<Plus size={18} />}
        label="Add task"
        onClick={() => setShowAddModal(true)}
      />

      <SidebarInput
        icon={<Search size={16} />}
        placeholder="Search todos..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <SidebarSection title="Views">
        <SidebarItem
          icon={<CheckSquare size={16} />}
          label="All Tasks"
          count={todoCount}
          isActive={!selectedProject && filterType === "all"}
          onClick={() => {
            setSelectedProject(null);
            setFilterType("all");
          }}
        />
        <SidebarItem
          icon={<InboxIcon size={16} />}
          label="No Project"
          count={inboxCount}
          isActive={!selectedProject && filterType === "inbox"}
          onClick={() => {
            setSelectedProject(null);
            setFilterType("inbox");
          }}
        />
        <SidebarItem
          icon={<Calendar size={16} />}
          label="Today"
          isActive={!selectedProject && filterType === "today"}
          onClick={() => {
            setSelectedProject(null);
            setFilterType("today");
          }}
        />
        <SidebarItem
          icon={<CalendarDays size={16} />}
          label="Upcoming"
          isActive={!selectedProject && filterType === "upcoming"}
          onClick={() => {
            setSelectedProject(null);
            setFilterType("upcoming");
          }}
        />
        <SidebarItem
          icon={<CheckCircle2 size={16} />}
          label="Completed"
          count={completedCount}
          isActive={!selectedProject && filterType === "completed"}
          onClick={() => {
            setSelectedProject(null);
            setFilterType("completed");
          }}
          activeClassName="bg-gradient-to-r from-(--success)/15 to-(--success)/5 text-(--success) shadow-sm"
        />
      </SidebarSection>

      {!isCollapsed && (
        <div>
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-3">
            Priority
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-(--muted) rounded-lg hover:bg-(--card-hover) transition-colors cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-sm shadow-red-500/30"></span>
              High
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-(--muted) rounded-lg hover:bg-(--card-hover) transition-colors cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 shadow-sm shadow-amber-500/30"></span>
              Medium
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-(--muted) rounded-lg hover:bg-(--card-hover) transition-colors cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-slate-400 to-gray-400 shadow-sm shadow-slate-400/30"></span>
              Low
            </div>
          </div>
        </div>
      )}

      <SidebarSection
        title="My Projects"
        action={
          !isCollapsed && (
            <button
              onClick={() => setShowNewProject(!showNewProject)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--foreground) border border-(--border) hover:bg-(--card-hover) hover:border-(--primary)/30 transition-all"
            >
              <FolderPlus size={14} /> New
            </button>
          )
        }
      >
        {!isCollapsed && showNewProject && (
          <div className="mb-3 flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTodoProject();
                if (e.key === "Escape") setShowNewProject(false);
              }}
              autoFocus
            />
            <button
              className="rounded-lg bg-(--primary) text-(--primary-foreground) text-xs px-3 py-2 hover:bg-(--primary-hover) transition-colors"
              onClick={createTodoProject}
            >
              Create
            </button>
          </div>
        )}
        {projects.map((p) => (
          <SidebarItem
            key={p.id}
            icon={<FolderKanban size={16} />}
            label={p.name}
            isActive={selectedProject === p.id}
            onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}
          />
        ))}
        {projects.length === 0 && !isCollapsed && (
          <div className="text-xs text-(--muted) text-center py-4 border border-dashed border-(--border) rounded-xl">
            No projects yet
          </div>
        )}
      </SidebarSection>
    </div>
  );
}