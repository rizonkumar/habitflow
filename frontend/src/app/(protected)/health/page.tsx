"use client";

import { useEffect, useState, useMemo } from "react";
import { useHealthStore } from "../../../store/health";
import type { HealthLog } from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import { Droplets, Dumbbell, Moon, Utensils, Sparkles, Plus, Trash2, Heart, Calendar, CalendarDays, CalendarRange } from "lucide-react";

type TimeFilter = "today" | "week" | "month" | "all";
type TypeFilter = HealthLog["type"] | "all";

const typeConfig: Record<HealthLog["type"], { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  water: { icon: <Droplets size={18} />, color: "text-blue-500", bg: "bg-blue-500", label: "Water" },
  gym: { icon: <Dumbbell size={18} />, color: "text-orange-500", bg: "bg-orange-500", label: "Gym" },
  sleep: { icon: <Moon size={18} />, color: "text-indigo-500", bg: "bg-indigo-500", label: "Sleep" },
  diet: { icon: <Utensils size={18} />, color: "text-green-500", bg: "bg-green-500", label: "Diet" },
  custom: { icon: <Sparkles size={18} />, color: "text-purple-500", bg: "bg-purple-500", label: "Custom" },
};

export default function HealthPage() {
  const { logs, fetchLogs, createLog, deleteLog } = useHealthStore();
  const [type, setType] = useState<HealthLog["type"]>("water");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLog({ type, amount, unit });
    setAmount(undefined);
    setUnit("");
    setShowForm(false);
  };

  const filteredLogs = useMemo(() => {
    let result = logs;
    
    // Filter by time
    const now = new Date();
    if (timeFilter === "today") {
      result = result.filter((l) => new Date(l.date).toDateString() === now.toDateString());
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.date) >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.date) >= monthAgo);
    }
    
    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter);
    }
    
    return result;
  }, [logs, timeFilter, typeFilter]);

  // Group logs by date
  const logsByDate = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  // Stats
  const todayLogs = logs.filter((l) => new Date(l.date).toDateString() === new Date().toDateString());
  const typeCounts = Object.keys(typeConfig).reduce((acc, key) => {
    acc[key as HealthLog["type"]] = todayLogs.filter((l) => l.type === key).length;
    return acc;
  }, {} as Record<HealthLog["type"], number>);

  const sidebar = (
    <div className="space-y-6">
      {/* New Log Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
      >
        <Plus size={18} />
        New Log
      </button>

      {/* Time Filters */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Time Period</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setTimeFilter("today")}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              timeFilter === "today" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <Calendar size={16} />
            Today
          </button>
          <button
            onClick={() => setTimeFilter("week")}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              timeFilter === "week" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <CalendarDays size={16} />
            This Week
          </button>
          <button
            onClick={() => setTimeFilter("month")}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              timeFilter === "month" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <CalendarRange size={16} />
            This Month
          </button>
          <button
            onClick={() => setTimeFilter("all")}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              timeFilter === "all" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <Heart size={16} />
            All Time
          </button>
        </nav>
      </div>

      {/* Type Filters */}
      <div>
        <h3 className="text-xs font-semibold text-(--muted) uppercase tracking-wider mb-2">Activity Type</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              typeFilter === "all" ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
            }`}
          >
            <span>All Types</span>
            <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{todayLogs.length}</span>
          </button>
          {(Object.keys(typeConfig) as HealthLog["type"][]).map((key) => {
            const config = typeConfig[key];
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  typeFilter === key ? `${config.bg}/10 ${config.color}` : "text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground)"
                }`}
              >
                <span className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </span>
                <span className="text-xs bg-(--secondary) px-1.5 py-0.5 rounded">{typeCounts[key]}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="max-w-4xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">Health</h1>
          <p className="mt-1 text-sm text-(--muted)">
            {timeFilter === "today" ? "Today's activities" : timeFilter === "week" ? "This week" : timeFilter === "month" ? "This month" : "All activities"}
            {typeFilter !== "all" && ` • ${typeConfig[typeFilter].label}`}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(typeConfig) as HealthLog["type"][]).map((key) => {
            const config = typeConfig[key];
            return (
              <div key={key} className="rounded-xl border border-(--border) bg-(--card) p-3">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.bg}/10 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-(--foreground)">{typeCounts[key]}</p>
                    <p className="text-xs text-(--muted)">{config.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="rounded-xl border border-(--border) bg-(--card) p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--destructive)/10 text-(--destructive)">
                <Heart size={20} />
              </div>
              <h2 className="text-lg font-semibold text-(--foreground)">Log health activity</h2>
            </div>
            <form className="grid gap-4 sm:grid-cols-4" onSubmit={onAdd}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground)">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HealthLog["type"])}
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                >
                  <option value="water">💧 Water</option>
                  <option value="gym">🏋️ Gym</option>
                  <option value="sleep">😴 Sleep</option>
                  <option value="diet">🥗 Diet</option>
                  <option value="custom">✨ Custom</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground)">Amount</label>
                <input
                  type="number"
                  value={amount ?? ""}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-(--foreground)">Unit</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ml, hrs, mins"
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) px-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover)"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-4">
          {Object.entries(logsByDate).length > 0 ? (
            Object.entries(logsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateLogs]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={14} className="text-(--muted)" />
                    <h3 className="text-sm font-medium text-(--muted)">
                      {new Date(date).toDateString() === new Date().toDateString() ? "Today" : date}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {dateLogs.map((log) => {
                      const config = typeConfig[log.type];
                      return (
                        <div
                          key={log.id}
                          className="group flex items-center gap-4 rounded-xl border border-(--border) bg-(--card) p-4 transition-colors hover:bg-(--card-hover)"
                        >
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${config.bg}/10 ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-(--foreground)">{config.label}</p>
                            <p className="text-xs text-(--muted)">
                              {log.amount !== undefined && log.amount !== null ? `${log.amount} ${log.unit || ""}` : "Logged"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteLog(log.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-(--muted) opacity-0 group-hover:opacity-100 hover:bg-(--destructive)/10 hover:text-(--destructive) transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          ) : (
            <div className="rounded-xl border border-(--border) border-dashed bg-(--card) p-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-(--destructive)/10 text-(--destructive)">
                <Heart size={24} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-(--foreground)">No health logs</h3>
              <p className="mt-1 text-sm text-(--muted)">
                {timeFilter !== "all" || typeFilter !== "all" ? "Try adjusting your filters." : "Start tracking your daily health habits."}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
              >
                <Plus size={16} />
                Log Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
