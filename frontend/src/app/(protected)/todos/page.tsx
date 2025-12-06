"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../../../store/projects";
import { useTodoStore } from "../../../store/todos";
import type { Todo } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Plus, CheckSquare, CheckCircle2, Pencil, X, Check, RotateCcw, Search, Calendar, CalendarDays } from "lucide-react";

type FilterType = "all" | "today" | "upcoming" | "completed";

export default function TodosPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { items, fetchTodos, addTodo, toggleTodo, updateTodo, loading } = useTodoStore();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProject) {
      fetchTodos(selectedProject, filterType === "completed" ? "completed" : undefined);
    }
  }, [selectedProject, filterType, fetchTodos]);

  useEffect(() => {
    if (selectedProject || !projects.length) return;
    setSelectedProject(projects[0].id);
  }, [projects, selectedProject]);

  const filteredTodos = useMemo(() => {
    let result = items;
    
    if (filterType === "completed") {
      result = result.filter((t) => t.status === "completed");
    } else if (filterType === "today") {
      const today = new Date().toDateString();
      result = result.filter((t) => t.status === "todo" && (!t.dueDate || new Date(t.dueDate).toDateString() === today));
    } else if (filterType === "upcoming") {
      const today = new Date();
      result = result.filter((t) => t.status === "todo" && t.dueDate && new Date(t.dueDate) > today);
    } else {
      result = result.filter((t) => t.status === "todo");
    }
    
    if (searchQuery) {
      result = result.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result;
  }, [items, filterType, searchQuery]);

  const todoCount = items.filter((t) => t.status === "todo").length;
  const completedCount = items.filter((t) => t.status === "completed").length;

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProject) return;
    await addTodo({ projectId: selectedProject, title });
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

  const sidebar = (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
        <input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-9 pr-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring)"
        />
      </div>

      {/* Project Selector */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Project</h3>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--ring)"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Views</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setFilterType("all")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filterType === "all" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckSquare size={16} />
              All Todos
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{todoCount}</span>
          </button>
          <button
            onClick={() => setFilterType("today")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filterType === "today" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              Today
            </span>
          </button>
          <button
            onClick={() => setFilterType("upcoming")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filterType === "upcoming" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />
              Upcoming
            </span>
          </button>
          <button
            onClick={() => setFilterType("completed")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filterType === "completed" ? "bg-(--success)/10 text-(--success)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Completed
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{completedCount}</span>
          </button>
        </nav>
      </div>

      {/* Priority Legend */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Priority</h3>
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
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="max-w-4xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">Todos</h1>
          <p className="mt-1 text-sm text-(--muted)">
            {filterType === "all" ? "All tasks" : filterType === "today" ? "Tasks for today" : filterType === "upcoming" ? "Upcoming tasks" : "Completed tasks"}
          </p>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={onAdd} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-10 pr-4 py-3 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <CheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" size={18} />
          </div>
          <button
            type="submit"
            disabled={!selectedProject || !title.trim()}
            className="flex items-center gap-2 rounded-lg bg-(--primary) px-5 py-3 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>

        {/* Todo List */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-(--border) bg-(--card) p-4">
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
                  todo.status === "completed" ? "border-(--border) opacity-70" : "border-(--border) hover:border-(--primary)/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id, todo.status === "todo" ? "completed" : "todo")}
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
                      <p className={`text-sm font-medium ${todo.status === "completed" ? "text-(--muted) line-through" : "text-(--foreground)"}`}>
                        {todo.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        todo.priority === "high" ? "bg-(--destructive)/10 text-(--destructive)" :
                        todo.priority === "medium" ? "bg-(--warning)/10 text-(--warning)" :
                        "bg-(--secondary) text-(--muted)"
                      }`}>
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
                {filterType === "all" ? "No todos yet" : `No ${filterType} todos`}
              </h3>
              <p className="mt-1 text-sm text-(--muted)">
                {filterType === "all" ? "Add your first todo to get started." : "Switch filters to see other todos."}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
