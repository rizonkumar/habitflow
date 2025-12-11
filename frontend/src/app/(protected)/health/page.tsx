"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useHealthStore, CreateHealthLogPayload } from "../../../store/health";
import type {
  HealthLog,
  HealthLogType,
  SleepQuality,
  MealType,
} from "../../../types/api";
import { AppShell } from "../../../components/app/AppShell";
import {
  SidebarItem,
  SidebarSection,
  SidebarButton,
} from "../../../components/app/SidebarItem";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Droplets,
  Dumbbell,
  Moon,
  Utensils,
  Sparkles,
  Plus,
  Trash2,
  Heart,
  Calendar,
  CalendarDays,
  CalendarRange,
  Activity,
  TrendingUp,
  X,
  Flame,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Cookie,
} from "lucide-react";

type TimeFilter = "today" | "week" | "month" | "all";
type TypeFilter = HealthLogType | "all";

const workoutTypes = [
  "Running",
  "Walking",
  "Weight Training",
  "Yoga",
  "Swimming",
  "Cycling",
  "HIIT",
  "Meditation",
  "Stretching",
  "Other",
];

const sleepQualities: { value: SleepQuality; label: string; color: string }[] =
  [
    { value: "low", label: "Low", color: "text-red-500" },
    { value: "good", label: "Good", color: "text-yellow-500" },
    { value: "excellent", label: "Excellent", color: "text-green-500" },
  ];

const mealTypes: { value: MealType; label: string; icon: React.ReactNode }[] = [
  { value: "breakfast", label: "Breakfast", icon: <Sunrise size={16} /> },
  { value: "lunch", label: "Lunch", icon: <Sun size={16} /> },
  { value: "dinner", label: "Dinner", icon: <Sunset size={16} /> },
  { value: "snack", label: "Snack", icon: <Cookie size={16} /> },
];

function HealthLoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-(--border) bg-(--card) p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-8 h-6 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-(--border) bg-(--card) p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-2 w-12" />
                </div>
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 mb-3" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 mb-3" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="w-6 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const typeConfig: Record<
  HealthLogType,
  {
    icon: React.ReactNode;
    color: string;
    bg: string;
    gradient: string;
    border: string;
    label: string;
  }
> = {
  water: {
    icon: <Droplets size={18} />,
    color: "text-blue-500",
    bg: "bg-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    label: "Water",
  },
  gym: {
    icon: <Dumbbell size={18} />,
    color: "text-orange-500",
    bg: "bg-orange-500",
    gradient: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/30",
    label: "Activity",
  },
  sleep: {
    icon: <Moon size={18} />,
    color: "text-indigo-500",
    bg: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-purple-500/10",
    border: "border-indigo-500/30",
    label: "Sleep",
  },
  diet: {
    icon: <Utensils size={18} />,
    color: "text-green-500",
    bg: "bg-green-500",
    gradient: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/30",
    label: "Diet",
  },
  custom: {
    icon: <Sparkles size={18} />,
    color: "text-purple-500",
    bg: "bg-purple-500",
    gradient: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/30",
    label: "Custom",
  },
};

export default function HealthPage() {
  const { logs, fetchLogs, createLog, deleteLog, loading } = useHealthStore();
  const [type, setType] = useState<HealthLogType>("water");
  const [showForm, setShowForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const searchParams = useSearchParams();
  const [initialLoad, setInitialLoad] = useState(true);

  const [glasses, setGlasses] = useState(1);
  const [milliliters, setMilliliters] = useState<number | undefined>(undefined);

  const [workoutType, setWorkoutType] = useState(workoutTypes[0]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(
    undefined
  );
  const [notes, setNotes] = useState("");

  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState<SleepQuality>("good");

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState<number | undefined>(undefined);
  const [carbs, setCarbs] = useState<number | undefined>(undefined);
  const [fat, setFat] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");

  const [customName, setCustomName] = useState("");
  const [customValue, setCustomValue] = useState(0);
  const [customUnit, setCustomUnit] = useState("");

  useEffect(() => {
    fetchLogs().finally(() => setInitialLoad(false));
  }, [fetchLogs]);

  useEffect(() => {
    const add = searchParams.get("add");
    const period = searchParams.get("period") as TimeFilter | null;
    const t = searchParams.get("type") as HealthLogType | null;
    if (period && ["today", "week", "month", "all"].includes(period)) {
      setTimeFilter(period);
    }
    if (t && ["water", "gym", "sleep", "diet", "custom"].includes(t)) {
      setType(t);
    }
    if (add === "1") {
      setShowForm(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setGlasses(1);
    setMilliliters(undefined);
    setWorkoutType(workoutTypes[0]);
    setDurationMinutes(30);
    setCaloriesBurned(undefined);
    setNotes("");
    setBedtime("");
    setWakeTime("");
    setQuality("good");
    setMealType("breakfast");
    setCalories(0);
    setProtein(undefined);
    setCarbs(undefined);
    setFat(undefined);
    setDescription("");
    setCustomName("");
    setCustomValue(0);
    setCustomUnit("");
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: CreateHealthLogPayload;

    switch (type) {
      case "water":
        payload = { type: "water", glasses, milliliters };
        break;
      case "gym":
        payload = {
          type: "gym",
          workoutType,
          durationMinutes,
          caloriesBurned,
          notes: notes || undefined,
        };
        break;
      case "sleep":
        payload = { type: "sleep", bedtime, wakeTime, quality };
        break;
      case "diet":
        payload = {
          type: "diet",
          mealType,
          calories,
          protein,
          carbs,
          fat,
          description: description || undefined,
        };
        break;
      case "custom":
        payload = {
          type: "custom",
          name: customName,
          value: customValue,
          unit: customUnit,
        };
        break;
    }

    await createLog(payload);
    resetForm();
    setShowForm(false);
  };

  const filteredLogs = useMemo(() => {
    let result = logs;

    const now = new Date();
    if (timeFilter === "today") {
      result = result.filter(
        (l) => new Date(l.date).toDateString() === now.toDateString()
      );
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.date) >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.date) >= monthAgo);
    }

    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter);
    }

    return result;
  }, [logs, timeFilter, typeFilter]);

  const logsByDate = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const todayLogs = logs.filter(
    (l) => new Date(l.date).toDateString() === new Date().toDateString()
  );
  const typeCounts = Object.keys(typeConfig).reduce((acc, key) => {
    acc[key as HealthLogType] = todayLogs.filter(
      (l) => l.type === key
    ).length;
    return acc;
  }, {} as Record<HealthLogType, number>);

  const totalTodayLogs = todayLogs.length;
  const selectedTypeConfig = typeConfig[type];

  const sidebar = (
    <HealthSidebar
      showForm={showForm}
      setShowForm={setShowForm}
      timeFilter={timeFilter}
      setTimeFilter={setTimeFilter}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      totalTodayLogs={totalTodayLogs}
      typeCounts={typeCounts}
    />
  );

  if (initialLoad && loading) {
    return (
      <AppShell sidebar={<HealthSidebarSkeleton />}>
        <HealthLoadingSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell sidebar={sidebar}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-500">
                <Heart size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--foreground) tracking-tight">
                  Health
                </h1>
                <p className="text-sm text-(--muted)">
                  {timeFilter === "today"
                    ? "Today's activities"
                    : timeFilter === "week"
                    ? "This week"
                    : timeFilter === "month"
                    ? "This month"
                    : "All activities"}
                  {typeFilter !== "all" && ` • ${typeConfig[typeFilter].label}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-(--secondary)/50 border border-(--border)">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-(--muted)">
              <TrendingUp size={14} />
              <span className="font-medium text-(--foreground)">
                {totalTodayLogs}
              </span>
              <span className="hidden sm:inline">today</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {(Object.keys(typeConfig) as HealthLogType[]).map((key) => {
            const config = typeConfig[key];
            const count = typeCounts[key];
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? "all" : key)}
                className={`group relative rounded-2xl border-2 bg-(--card) p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                  typeFilter === key
                    ? `${config.border} shadow-lg`
                    : "border-(--border) hover:border-(--primary)/30"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-50`}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.bg}/20 ${config.color} transition-transform group-hover:scale-110`}
                    >
                      {config.icon}
                    </div>
                    {count > 0 && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${config.bg}/20 ${config.color}`}
                      >
                        +{count}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-(--foreground)">
                    {count}
                  </p>
                  <p className="text-xs font-medium text-(--muted) mt-0.5">
                    {config.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {showForm && (
          <div className="rounded-2xl border-2 border-(--primary)/50 bg-(--card) overflow-hidden shadow-xl shadow-(--primary)/5 animate-in">
            <div
              className={`p-5 bg-gradient-to-r ${selectedTypeConfig.gradient}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color}`}
                  >
                    {selectedTypeConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-(--foreground)">
                      Log health activity
                    </h2>
                    <p className="text-sm text-(--muted)">
                      Track your daily wellness habits
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <form className="p-5" onSubmit={onAdd}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--foreground)">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(typeConfig) as HealthLogType[]).map((key) => {
                      const config = typeConfig[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setType(key)}
                          className={`flex items-center justify-center w-full aspect-square rounded-xl border-2 transition-all ${
                            type === key
                              ? `${config.border} ${config.bg}/20 ${config.color} shadow-lg scale-105`
                              : "border-(--border) text-(--muted) hover:border-(--muted)"
                          }`}
                          title={config.label}
                        >
                          {config.icon}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-(--muted) text-center">
                    Selected:{" "}
                    <span className={selectedTypeConfig.color}>
                      {selectedTypeConfig.label}
                    </span>
                  </p>
                </div>

                {type === "water" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                        <Droplets size={14} className="text-blue-500" />
                        Glasses
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGlasses(Math.max(1, glasses - 1))}
                          className="w-10 h-10 rounded-xl border border-(--border) flex items-center justify-center text-(--foreground) hover:bg-(--secondary) transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={glasses}
                          onChange={(e) => setGlasses(Math.max(1, Number(e.target.value)))}
                          className="flex-1 rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) text-center outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                        <button
                          type="button"
                          onClick={() => setGlasses(glasses + 1)}
                          className="w-10 h-10 rounded-xl border border-(--border) flex items-center justify-center text-(--foreground) hover:bg-(--secondary) transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">
                        Milliliters (optional)
                      </label>
                      <input
                        type="number"
                        value={milliliters ?? ""}
                        onChange={(e) => setMilliliters(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 250"
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                  </div>
                )}

                {type === "gym" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                        <Dumbbell size={14} className="text-orange-500" />
                        Workout Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {workoutTypes.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWorkoutType(w)}
                            className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                              workoutType === w
                                ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                                : "border-(--border) text-(--muted) hover:border-(--muted)"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                          <Clock size={14} className="text-orange-500" />
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                          <Flame size={14} className="text-orange-500" />
                          Calories Burned (optional)
                        </label>
                        <input
                          type="number"
                          value={caloriesBurned ?? ""}
                          onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 300"
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">Notes (optional)</label>
                      <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did it go?"
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                  </div>
                )}

                {type === "sleep" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                          <Moon size={14} className="text-indigo-500" />
                          Bedtime
                        </label>
                        <input
                          type="datetime-local"
                          value={bedtime}
                          onChange={(e) => setBedtime(e.target.value)}
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                          <Sunrise size={14} className="text-indigo-500" />
                          Wake Time
                        </label>
                        <input
                          type="datetime-local"
                          value={wakeTime}
                          onChange={(e) => setWakeTime(e.target.value)}
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">Sleep Quality</label>
                      <div className="grid grid-cols-3 gap-2">
                        {sleepQualities.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => setQuality(q.value)}
                            className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              quality === q.value
                                ? `border-indigo-500/50 bg-indigo-500/10 ${q.color}`
                                : "border-(--border) text-(--muted) hover:border-(--muted)"
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {type === "diet" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                        <Utensils size={14} className="text-green-500" />
                        Meal Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {mealTypes.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMealType(m.value)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              mealType === m.value
                                ? "border-green-500/50 bg-green-500/10 text-green-500"
                                : "border-(--border) text-(--muted) hover:border-(--muted)"
                            }`}
                          >
                            {m.icon}
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                          <Flame size={14} className="text-green-500" />
                          Calories
                        </label>
                        <input
                          type="number"
                          value={calories}
                          onChange={(e) => setCalories(Number(e.target.value))}
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground)">Protein (g)</label>
                        <input
                          type="number"
                          value={protein ?? ""}
                          onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="optional"
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground)">Carbs (g)</label>
                        <input
                          type="number"
                          value={carbs ?? ""}
                          onChange={(e) => setCarbs(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="optional"
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--foreground)">Fat (g)</label>
                        <input
                          type="number"
                          value={fat ?? ""}
                          onChange={(e) => setFat(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="optional"
                          className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">Description (optional)</label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What did you eat?"
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                  </div>
                )}

                {type === "custom" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground) flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-500" />
                        Name
                      </label>
                      <input
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Steps, Heart Rate"
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">Value</label>
                      <input
                        type="number"
                        value={customValue}
                        onChange={(e) => setCustomValue(Number(e.target.value))}
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-(--foreground)">Unit</label>
                      <input
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="e.g. steps, bpm"
                        className="w-full rounded-xl border border-(--input-border) bg-(--input) px-4 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-all focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-(--border) px-5 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02]"
                >
                  <Plus size={16} />
                  Add Log
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(logsByDate).length > 0 ? (
            Object.entries(logsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateLogs]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--secondary) text-(--muted)">
                      <Calendar size={14} />
                    </div>
                    <h3 className="text-sm font-semibold text-(--foreground)">
                      {new Date(date).toDateString() ===
                      new Date().toDateString()
                        ? "Today"
                        : new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                    </h3>
                    <span className="text-xs font-medium bg-(--secondary) px-2 py-0.5 rounded-full text-(--muted)">
                      {dateLogs.length} {dateLogs.length === 1 ? "log" : "logs"}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dateLogs.map((log) => {
                      const config = typeConfig[log.type];
                      return (
                        <div
                          key={log.id}
                          className={`group relative rounded-2xl border-2 bg-(--card) p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${config.border}`}
                        >
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-30`}
                          />
                          <div className="relative flex items-start gap-4">
                            <div
                              className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${config.bg}/20 ${config.color}`}
                            >
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-(--foreground)">
                                  {log.type === "water" && `${log.glasses} glass${log.glasses > 1 ? "es" : ""}`}
                                  {log.type === "gym" && log.workoutType}
                                  {log.type === "sleep" && `${Math.floor(log.sleepDurationMinutes / 60)}h ${log.sleepDurationMinutes % 60}m`}
                                  {log.type === "diet" && log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1)}
                                  {log.type === "custom" && log.name}
                                </p>
                                {log.type === "sleep" && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                    log.quality === "excellent" ? "bg-green-500/20 text-green-500" :
                                    log.quality === "good" ? "bg-yellow-500/20 text-yellow-500" :
                                    "bg-red-500/20 text-red-500"
                                  }`}>
                                    {log.quality}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-(--muted) mt-1">
                                {log.type === "water" && log.milliliters && `${log.milliliters} ml`}
                                {log.type === "gym" && (
                                  <span className="flex items-center gap-2 flex-wrap">
                                    <span>{log.durationMinutes} min</span>
                                    {log.caloriesBurned && <span>• {log.caloriesBurned} cal</span>}
                                  </span>
                                )}
                                {log.type === "sleep" && (
                                  <span>
                                    {new Date(log.bedtime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                    {" → "}
                                    {new Date(log.wakeTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                  </span>
                                )}
                                {log.type === "diet" && (
                                  <span className="flex items-center gap-2 flex-wrap">
                                    <span>{log.calories} cal</span>
                                    {log.protein && <span>• P: {log.protein}g</span>}
                                    {log.carbs && <span>• C: {log.carbs}g</span>}
                                    {log.fat && <span>• F: {log.fat}g</span>}
                                  </span>
                                )}
                                {log.type === "custom" && `${log.value} ${log.unit}`}
                              </p>
                              {log.type === "gym" && log.notes && (
                                <p className="text-xs text-(--muted) mt-1 truncate">{log.notes}</p>
                              )}
                              {log.type === "diet" && log.description && (
                                <p className="text-xs text-(--muted) mt-1 truncate">{log.description}</p>
                              )}
                              <p className="text-[10px] text-(--muted) mt-1.5">
                                {new Date(log.date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteLog(log.id)}
                              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-(--muted) opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-(--border) bg-(--card) p-12 sm:p-16 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-500">
                <Heart size={28} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-(--foreground)">
                No health logs
              </h3>
              <p className="mt-2 text-sm text-(--muted) max-w-md mx-auto">
                {timeFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more activities."
                  : "Start tracking your daily health habits to see your progress here."}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary) to-blue-600 px-6 py-3 text-sm font-semibold text-(--primary-foreground) shadow-lg shadow-(--primary)/25 transition-all hover:shadow-xl hover:shadow-(--primary)/30 hover:scale-[1.02]"
              >
                <Plus size={16} />
                Log Your First Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function HealthSidebar({
  showForm,
  setShowForm,
  timeFilter,
  setTimeFilter,
  typeFilter,
  setTypeFilter,
  totalTodayLogs,
  typeCounts,
}: {
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (f: TypeFilter) => void;
  totalTodayLogs: number;
  typeCounts: Record<HealthLogType, number>;
}) {
  return (
    <div className="space-y-6">
      <SidebarButton
        icon={<Plus size={18} />}
        label="New Log"
        onClick={() => setShowForm(!showForm)}
      />

      <SidebarSection title="Time Period">
        <SidebarItem
          icon={<Calendar size={16} />}
          label="Today"
          isActive={timeFilter === "today"}
          onClick={() => setTimeFilter("today")}
        />
        <SidebarItem
          icon={<CalendarDays size={16} />}
          label="This Week"
          isActive={timeFilter === "week"}
          onClick={() => setTimeFilter("week")}
        />
        <SidebarItem
          icon={<CalendarRange size={16} />}
          label="This Month"
          isActive={timeFilter === "month"}
          onClick={() => setTimeFilter("month")}
        />
        <SidebarItem
          icon={<Heart size={16} />}
          label="All Time"
          isActive={timeFilter === "all"}
          onClick={() => setTimeFilter("all")}
        />
      </SidebarSection>

      <SidebarSection title="Activity Type">
        <SidebarItem
          icon={<Activity size={16} />}
          label="All Types"
          count={totalTodayLogs}
          isActive={typeFilter === "all"}
          onClick={() => setTypeFilter("all")}
        />
        {(Object.keys(typeConfig) as HealthLogType[]).map((key) => {
          const config = typeConfig[key];
          return (
            <SidebarItem
              key={key}
              icon={config.icon}
              label={config.label}
              count={typeCounts[key]}
              isActive={typeFilter === key}
              onClick={() => setTypeFilter(key)}
              activeClassName={`bg-gradient-to-r ${config.gradient} ${config.color} shadow-sm`}
            />
          );
        })}
      </SidebarSection>
    </div>
  );
}
