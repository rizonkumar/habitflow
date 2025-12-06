"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../../../store/projects";
import { useTodoStore } from "../../../store/todos";
import type { Todo } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import { Skeleton } from "../../../components/ui/Skeleton";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

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

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo({ projectId: selectedProject || undefined, title });
    setTitle("");
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingTitle.trim()) return;
    await updateTodo({
      todoId: editingId,
      title: editingTitle,
      description: undefined,
      dueDate: undefined,
      priority: undefined,
      tags: undefined,
    });
    setEditingId(null);
    setEditingTitle("");
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
              Inbox
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
              ? "Inbox"
              : filterType === "today"
              ? "Tasks for today"
              : filterType === "upcoming"
              ? "Upcoming tasks"
              : "Completed tasks"}
          </p>
        </div>

        <form onSubmit={onAdd} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-10 pr-4 py-3 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <CheckSquare
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
              size={18}
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-2 rounded-lg bg-(--primary) px-5 py-3 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
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
                      <input
                        className="w-full rounded-md border border-(--input-border) bg-(--input) px-2 py-1 text-sm text-(--foreground) outline-none focus:border-(--ring)"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <p
                        className={`text-sm font-medium ${
                          todo.status === "completed"
                            ? "text-(--muted) line-through"
                            : "text-(--foreground)"
                        }`}
                      >
                        {todo.title}
                      </p>
                    )}
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
    </AppShell>
  );
}
