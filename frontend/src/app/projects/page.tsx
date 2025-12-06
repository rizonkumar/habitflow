"use client";

import { useEffect, useState, useMemo } from "react";
import { useProjectStore } from "../../store/projects";
import type { Project } from "../../types/api";
import { AppShell } from "../../components/app/AppShell";
import { Skeleton } from "../../components/ui/Skeleton";
import { Plus, FolderKanban, Users, Layers, CheckSquare, Layout, Heart, Search } from "lucide-react";

type TypeFilter = Project["type"] | "all";

const typeIcons: Record<Project["type"], React.ReactNode> = {
  mixed: <Layers size={18} />,
  todo: <CheckSquare size={18} />,
  jira: <Layout size={18} />,
  health: <Heart size={18} />,
};

const typeColors: Record<Project["type"], string> = {
  mixed: "bg-(--primary)",
  todo: "bg-(--success)",
  jira: "bg-(--accent)",
  health: "bg-(--destructive)",
};

const typeLabels: Record<Project["type"], string> = {
  mixed: "Mixed",
  todo: "Todo",
  jira: "Board",
  health: "Health",
};

export default function ProjectsPage() {
  const { projects, fetchProjects, createProject, loading } = useProjectStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "mixed" as Project["type"],
  });
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    
    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter);
    }
    
    if (searchQuery) {
      result = result.filter((p) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [projects, typeFilter, searchQuery]);

  const typeCounts = (Object.keys(typeIcons) as Project["type"][]).reduce((acc, key) => {
    acc[key] = projects.filter((p) => p.type === key).length;
    return acc;
  }, {} as Record<Project["type"], number>);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createProject(form);
    setForm({ name: "", description: "", type: "mixed" });
    setShowForm(false);
  };

  const sidebar = (
    <div className="space-y-6">
      {/* New Project Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
      >
        <Plus size={18} />
        New Project
      </button>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-9 pr-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--ring)"
        />
      </div>

      {/* Type Filters */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Filter by Type</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              typeFilter === "all" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderKanban size={16} />
              All Projects
            </span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{projects.length}</span>
          </button>
          {(Object.keys(typeIcons) as Project["type"][]).map((key) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                typeFilter === key ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
              }`}
            >
              <span className="flex items-center gap-2">
                {typeIcons[key]}
                {typeLabels[key]}
              </span>
              <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{typeCounts[key]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Summary</h3>
        <div className="rounded-lg border border-(--border) bg-(--card-hover) p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-(--muted)">Total Projects</span>
            <span className="font-semibold text-(--foreground)">{projects.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="max-w-5xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">Projects</h1>
          <p className="mt-1 text-sm text-(--muted)">
            {typeFilter === "all" ? "All projects" : `${typeLabels[typeFilter]} projects`}
            {filteredProjects.length !== projects.length && ` • ${filteredProjects.length} results`}
          </p>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-xl border border-(--border) bg-(--card) p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary)/10 text-(--primary)">
                <FolderKanban size={20} />
              </div>
              <h2 className="text-lg font-semibold text-(--foreground)">Create new project</h2>
            </div>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground)">Name</label>
                <input
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  placeholder="My awesome project"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground)">Type</label>
                <select
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Project["type"] })}
                >
                  <option value="mixed">Mixed</option>
                  <option value="todo">Todo</option>
                  <option value="jira">Board</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-(--foreground)">Description</label>
                <input
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  placeholder="Optional description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl border border-(--border) bg-(--card) p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            : filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-colors hover:bg-(--card-hover)"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${typeColors[project.type]} text-white`}>
                        {typeIcons[project.type]}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-(--foreground)">{project.name}</h3>
                        <p className="text-xs text-(--muted) capitalize">{typeLabels[project.type]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-(--muted)">
                      <Users size={14} />
                      <span className="text-xs">{project.members.length}</span>
                    </div>
                  </div>
                  {project.description && (
                    <p className="mt-3 text-sm text-(--muted) line-clamp-2">{project.description}</p>
                  )}
                </div>
              ))}
        </div>

        {/* Empty State */}
        {!loading && !filteredProjects.length && (
          <div className="rounded-xl border border-(--border) border-dashed bg-(--card) p-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-(--primary)/10 text-(--primary)">
              <FolderKanban size={24} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-(--foreground)">
              {typeFilter !== "all" || searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="mt-1 text-sm text-(--muted)">
              {typeFilter !== "all" || searchQuery ? "Try adjusting your filters." : "Create your first project to get started."}
            </p>
            {!searchQuery && typeFilter === "all" && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
              >
                <Plus size={16} />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
