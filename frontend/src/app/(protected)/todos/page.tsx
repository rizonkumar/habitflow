"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useProjectStore } from "../../../store/projects";
import { useTodoStore } from "../../../store/todos";
import type { Todo } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
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
} from "lucide-react";

type FilterType = "all" | "inbox" | "today" | "upcoming" | "completed";

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
      result = result.filter(
        (t) => t.status === "todo" && t.dueDate && new Date(t.dueDate) > now
      );
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

  // Priority options for Select
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

  const sidebar = (
    <div className="space-y-6">
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
      >
        <Plus size={18} />
        Add task
      </button>
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
        />
        <input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-9 pr-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring)"
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Views
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => {
              setSelectedProject(null);
              setFilterType("all");
            }}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !selectedProject && filterType === "all"
                ? "bg-(--primary)/10 text-(--primary)"
                : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckSquare size={16} />
              All Tasks
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">
              {todoCount}
            </span>
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setFilterType("inbox");
            }}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !selectedProject && filterType === "inbox"
                ? "bg-(--primary)/10 text-(--primary)"
                : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <InboxIcon size={16} />
              No Project
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">
              {inboxCount}
            </span>
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setFilterType("today");
            }}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !selectedProject && filterType === "today"
                ? "bg-(--primary)/10 text-(--primary)"
                : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              Today
            </span>
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setFilterType("upcoming");
            }}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !selectedProject && filterType === "upcoming"
                ? "bg-(--primary)/10 text-(--primary)"
                : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />
              Upcoming
            </span>
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setFilterType("completed");
            }}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !selectedProject && filterType === "completed"
                ? "bg-(--success)/10 text-(--success)"
                : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Completed
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">
              {completedCount}
            </span>
          </button>
        </nav>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">
          Priority
        </h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--muted)">
            <span className="w-2 h-2 rounded-full bg-(--destructive)"></span>
            High
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--muted)">
            <span className="w-2 h-2 rounded-full bg-(--warning)"></span>
            Medium
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--muted)">
            <span className="w-2 h-2 rounded-full bg-(--muted)"></span>
            Low
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            My Projects
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
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createTodoProject();
                if (e.key === "Escape") setShowNewProject(false);
              }}
              autoFocus
            />
            <button
              className="rounded-md bg-(--primary) text-(--primary-foreground) text-xs px-3 py-1.5 hover:bg-(--primary-hover)"
              onClick={createTodoProject}
            >
              Create
            </button>
          </div>
        )}

        <nav className="space-y-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setSelectedProject((curr) => (curr === p.id ? null : p.id))
              }
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedProject === p.id
                  ? "bg-(--primary)/10 text-(--primary)"
                  : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FolderKanban size={16} />
                <span className="truncate">{p.name}</span>
              </span>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="text-xs text-(--muted)">No projects yet</div>
          )}
        </nav>
      </div>
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">Todos</h1>
          <p className="mt-1 text-sm text-(--muted)">
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

        <form
          onSubmit={onAdd}
          className={`rounded-2xl border ${
            composerOpen ? "border-(--ring) shadow-lg" : "border-(--border)"
          } bg-(--card) p-4 shadow-sm transition-all`}
        >
          <div className="relative mb-4">
            <input
              id="new-todo-input"
              className="w-full rounded-xl border-0 bg-(--secondary)/50 pl-11 pr-4 py-3.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:bg-(--secondary) focus:ring-2 focus:ring-(--ring)/30"
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

          <div className="flex flex-wrap items-center gap-2">
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
              className="inline-flex items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--muted) opacity-50 cursor-not-allowed"
            >
              <Bell size={15} />
              Reminders
            </button>

            <div className="flex-1" />

            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-(--primary-foreground) transition-all hover:bg-(--primary-hover) hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add task
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-(--border) bg-(--card) p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-5 flex-1" />
                </div>
              </div>
            ))
          ) : filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group rounded-xl border bg-(--card) p-4 transition-colors ${
                  todo.status === "completed"
                    ? "border-(--border) opacity-70"
                    : "border-(--border) hover:border-(--primary)/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggleTodo(
                        todo.id,
                        todo.status === "todo" ? "completed" : "todo"
                      )
                    }
                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                      todo.status === "completed"
                        ? "bg-(--success) border-(--success) text-white"
                        : "border-(--border) hover:border-(--primary) text-transparent hover:text-(--primary)"
                    }`}
                  >
                    <Check size={14} />
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <>
                        <input
                          className="w-full rounded-md border border-(--input-border) bg-(--input) px-2 py-1 text-sm text-(--foreground) outline-none focus:border-(--ring)"
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
                            className="w-fit rounded-md border border-(--input-border) bg-(--input) px-2 py-1 text-xs text-(--foreground) outline-none focus:border-(--ring)"
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
                          className={`text-sm font-medium ${
                            todo.status === "completed"
                              ? "text-(--muted) line-through"
                              : "text-(--foreground)"
                          }`}
                        >
                          {todo.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              todo.priority === "high"
                                ? "bg-(--destructive)/10 text-(--destructive)"
                                : todo.priority === "medium"
                                ? "bg-(--warning)/10 text-(--warning)"
                                : "bg-(--secondary) text-(--muted)"
                            }`}
                          >
                            {todo.priority}
                          </span>
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
            ))
          ) : (
            <div className="rounded-xl border border-(--border) border-dashed bg-(--card) p-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-(--success)/10 text-(--success)">
                <CheckSquare size={24} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-(--foreground)">
                {filterType === "all"
                  ? "No todos yet"
                  : `No ${filterType} todos`}
              </h3>
              <p className="mt-1 text-sm text-(--muted)">
                {filterType === "all"
                  ? "Add your first todo to get started."
                  : "Switch filters to see other todos."}
              </p>
            </div>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-(--border) bg-(--card) shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-(--border)">
              <h2 className="text-lg font-semibold text-(--foreground)">
                Add task
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <input
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  className="w-full rounded-xl border-0 bg-(--secondary)/50 px-4 py-3.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:bg-(--secondary) focus:ring-2 focus:ring-(--ring)/30"
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
            <div className="flex items-center justify-end gap-3 p-5 border-t border-(--border)">
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
                className="rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-(--primary-foreground) hover:bg-(--primary-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
