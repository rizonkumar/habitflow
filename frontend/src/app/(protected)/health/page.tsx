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

type TimeFilter = "today" | "week" | "month" | "all" | "custom";
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
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const searchParams = useSearchParams();
  const [initialLoad, setInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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
    } else if (timeFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((l) => {
        const logDate = new Date(l.date);
        return logDate >= start && logDate <= end;
      });
    }

    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter);
    }

    return result;
  }, [logs, timeFilter, typeFilter, customStartDate, customEndDate]);

  const logsByDate = filteredLogs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const typeCounts = Object.keys(typeConfig).reduce((acc, key) => {
    acc[key as HealthLogType] = filteredLogs.filter(
      (l) => l.type === key
    ).length;
    return acc;
  }, {} as Record<HealthLogType, number>);

  const totalFilteredLogs = filteredLogs.length;
  const selectedTypeConfig = typeConfig[type];

  const summaryStats = useMemo(() => {
    const waterLogs = filteredLogs.filter((l) => l.type === "water") as Array<HealthLog & { type: "water" }>;
    const gymLogs = filteredLogs.filter((l) => l.type === "gym") as Array<HealthLog & { type: "gym" }>;
    const sleepLogs = filteredLogs.filter((l) => l.type === "sleep") as Array<HealthLog & { type: "sleep" }>;
    const dietLogs = filteredLogs.filter((l) => l.type === "diet") as Array<HealthLog & { type: "diet" }>;

    return {
      totalWaterGlasses: waterLogs.reduce((sum, l) => sum + l.glasses, 0),
      totalWorkoutMinutes: gymLogs.reduce((sum, l) => sum + l.durationMinutes, 0),
      totalCaloriesBurned: gymLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0),
      avgSleepHours: sleepLogs.length > 0 ? sleepLogs.reduce((sum, l) => sum + l.sleepDurationMinutes, 0) / sleepLogs.length / 60 : 0,
      totalCaloriesConsumed: dietLogs.reduce((sum, l) => sum + l.calories, 0),
      totalProtein: dietLogs.reduce((sum, l) => sum + (l.protein || 0), 0),
    };
  }, [filteredLogs]);

  const sidebar = (
    <HealthSidebar
      showForm={showForm}
      setShowForm={setShowForm}
      timeFilter={timeFilter}
      setTimeFilter={setTimeFilter}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      totalFilteredLogs={totalFilteredLogs}
      typeCounts={typeCounts}
      customStartDate={customStartDate}
      setCustomStartDate={setCustomStartDate}
      customEndDate={customEndDate}
      setCustomEndDate={setCustomEndDate}
    />
  );

  if (!mounted || (initialLoad && loading)) {
    return (
      <AppShell sidebar={<HealthSidebarSkeleton />}>
        <HealthLoadingSkeleton />
      </AppShell>
    );
  }

  const getTimeFilterLabel = () => {
    if (timeFilter === "today") return "Today's activities";
    if (timeFilter === "week") return "This week";
    if (timeFilter === "month") return "This month";
    if (timeFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = new Date(customEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${start} - ${end}`;
    }
    return "All activities";
  };

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
                  {getTimeFilterLabel()}
                  {typeFilter !== "all" && ` | ${typeConfig[typeFilter].label}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--secondary)/50 border border-(--border)">
              <TrendingUp size={14} className="text-(--muted)" />
              <span className="font-semibold text-(--foreground)">
                {totalFilteredLogs}
              </span>
              <span className="text-sm text-(--muted)">logs</span>
            </div>
          </div>
        </div>

        {filteredLogs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-3">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Droplets size={14} />
                <span className="text-xs font-medium">Water</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.totalWaterGlasses}</p>
              <p className="text-xs text-(--muted)">glasses</p>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <Clock size={14} />
                <span className="text-xs font-medium">Activity</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.totalWorkoutMinutes}</p>
              <p className="text-xs text-(--muted)">minutes</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-3">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <Flame size={14} />
                <span className="text-xs font-medium">Burned</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.totalCaloriesBurned}</p>
              <p className="text-xs text-(--muted)">calories</p>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-3">
              <div className="flex items-center gap-2 text-indigo-500 mb-1">
                <Moon size={14} />
                <span className="text-xs font-medium">Sleep</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.avgSleepHours.toFixed(1)}</p>
              <p className="text-xs text-(--muted)">avg hours</p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <Utensils size={14} />
                <span className="text-xs font-medium">Consumed</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.totalCaloriesConsumed}</p>
              <p className="text-xs text-(--muted)">calories</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-3">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <Dumbbell size={14} />
                <span className="text-xs font-medium">Protein</span>
              </div>
              <p className="text-lg font-bold text-(--foreground)">{summaryStats.totalProtein}</p>
              <p className="text-xs text-(--muted)">grams</p>
            </div>
          </div>
        )}

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
          <div className="rounded-2xl border border-(--border) bg-(--card) overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-5 py-4 bg-gradient-to-r from-(--secondary)/80 to-(--secondary)/40 border-b border-(--border)">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${selectedTypeConfig.bg} text-white shadow-lg`}>
                    {selectedTypeConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-(--foreground)">
                      New {selectedTypeConfig.label} Log
                    </h2>
                    <p className="text-xs text-(--muted)">Track your wellness</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl text-(--muted) hover:text-(--foreground) hover:bg-(--card) transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-b border-(--border) bg-(--card)">
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                {(Object.keys(typeConfig) as HealthLogType[]).map((key) => {
                  const config = typeConfig[key];
                  const isActive = type === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? `${config.bg} text-white shadow-md scale-[1.02]`
                          : "text-(--muted) hover:text-(--foreground) hover:bg-(--secondary)"
                      }`}
                    >
                      {config.icon}
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="p-5" onSubmit={onAdd}>
              <div className={`p-5 rounded-2xl mb-5 bg-gradient-to-br ${selectedTypeConfig.gradient} border ${selectedTypeConfig.border} shadow-inner`}>
                {type === "water" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color} mb-3`}>
                        <Droplets size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground)">Water Intake</h3>
                      <p className="text-xs text-(--muted) mt-1">How much water did you drink?</p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGlasses(Math.max(1, glasses - 1))}
                          className="w-12 h-12 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center text-(--foreground) hover:bg-(--secondary) hover:scale-105 transition-all text-xl font-medium shadow-sm"
                        >
                          −
                        </button>
                        <div className="w-24 text-center">
                          <span className="text-4xl font-bold text-(--foreground)">{glasses}</span>
                          <p className="text-xs text-(--muted) mt-1">glass{glasses > 1 ? "es" : ""}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGlasses(glasses + 1)}
                          className="w-12 h-12 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center text-(--foreground) hover:bg-(--secondary) hover:scale-105 transition-all text-xl font-medium shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 4, 8].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setGlasses(n)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              glasses === n
                                ? "bg-blue-500 text-white shadow-md"
                                : "bg-(--card) text-(--muted) hover:text-(--foreground) border border-(--border)"
                            }`}
                          >
                            {n} glass{n > 1 ? "es" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-(--border)/50">
                      <label className="text-xs font-medium text-(--muted)">Volume in ml (optional)</label>
                      <input
                        type="number"
                        value={milliliters ?? ""}
                        onChange={(e) => setMilliliters(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 250"
                        className="w-full h-10 mt-2 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {type === "gym" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color} mb-3`}>
                        <Dumbbell size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground)">Activity</h3>
                      <p className="text-xs text-(--muted) mt-1">What workout did you do?</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-(--muted)">Activity Type</label>
                      <div className="flex flex-wrap gap-2">
                        {workoutTypes.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWorkoutType(w)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                              workoutType === w
                                ? "bg-orange-500 text-white shadow-md scale-[1.02]"
                                : "bg-(--card) text-(--muted) hover:text-(--foreground) border border-(--border) hover:border-(--muted)"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted) flex items-center gap-1.5">
                          <Clock size={12} className="text-orange-500" /> Duration
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-4 pr-12 text-sm text-(--foreground) outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-(--muted)">min</span>
                        </div>
                        <div className="flex gap-1.5">
                          {[15, 30, 45, 60].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setDurationMinutes(n)}
                              className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                                durationMinutes === n
                                  ? "bg-orange-500 text-white"
                                  : "bg-(--card) text-(--muted) border border-(--border)"
                              }`}
                            >
                              {n}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted) flex items-center gap-1.5">
                          <Flame size={12} className="text-orange-500" /> Calories Burned
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={caloriesBurned ?? ""}
                            onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="optional"
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-4 pr-12 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-(--muted)">kcal</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-(--border)/50">
                      <label className="text-xs font-medium text-(--muted)">Notes (optional)</label>
                      <input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did it go?"
                        className="w-full h-10 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {type === "sleep" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color} mb-3`}>
                        <Moon size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground)">Sleep</h3>
                      <p className="text-xs text-(--muted) mt-1">How did you sleep?</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted) flex items-center gap-1.5">
                          <Moon size={12} className="text-indigo-500" /> Bedtime
                        </label>
                        <input
                          type="datetime-local"
                          value={bedtime}
                          onChange={(e) => setBedtime(e.target.value)}
                          className="w-full h-11 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted) flex items-center gap-1.5">
                          <Sunrise size={12} className="text-indigo-500" /> Wake Time
                        </label>
                        <input
                          type="datetime-local"
                          value={wakeTime}
                          onChange={(e) => setWakeTime(e.target.value)}
                          className="w-full h-11 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-(--muted)">How was your sleep?</label>
                      <div className="grid grid-cols-3 gap-3">
                        {sleepQualities.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => setQuality(q.value)}
                            className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                              quality === q.value
                                ? q.value === "excellent" ? "bg-green-500 text-white shadow-lg scale-[1.02]" :
                                  q.value === "good" ? "bg-yellow-500 text-white shadow-lg scale-[1.02]" :
                                  "bg-red-500 text-white shadow-lg scale-[1.02]"
                                : "bg-(--card) text-(--muted) hover:text-(--foreground) border border-(--border) hover:border-(--muted)"
                            }`}
                          >
                            {q.value === "excellent" ? "😊" : q.value === "good" ? "😐" : "😫"} {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {type === "diet" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color} mb-3`}>
                        <Utensils size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground)">Nutrition</h3>
                      <p className="text-xs text-(--muted) mt-1">What did you eat?</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-(--muted)">Meal Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {mealTypes.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMealType(m.value)}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                              mealType === m.value
                                ? "bg-green-500 text-white shadow-lg scale-[1.02]"
                                : "bg-(--card) text-(--muted) hover:text-(--foreground) border border-(--border) hover:border-(--muted)"
                            }`}
                          >
                            {m.icon}
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted) flex items-center gap-1">
                          <Flame size={10} className="text-green-500" /> Calories
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(Number(e.target.value))}
                            placeholder="0"
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-3 pr-10 text-sm text-(--foreground) outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-(--muted)">kcal</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Protein</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={protein ?? ""}
                            onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="-"
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-3 pr-6 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-(--muted)">g</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Carbs</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={carbs ?? ""}
                            onChange={(e) => setCarbs(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="-"
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-3 pr-6 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-(--muted)">g</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Fat</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={fat ?? ""}
                            onChange={(e) => setFat(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="-"
                            className="w-full h-11 rounded-xl border border-(--border) bg-(--card) pl-3 pr-6 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-(--muted)">g</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-(--border)/50">
                      <label className="text-xs font-medium text-(--muted)">Description (optional)</label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Grilled chicken salad"
                        className="w-full h-10 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {type === "custom" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${selectedTypeConfig.bg}/20 ${selectedTypeConfig.color} mb-3`}>
                        <Sparkles size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--foreground)">Custom</h3>
                      <p className="text-xs text-(--muted) mt-1">Track any metric you want</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Metric Name</label>
                        <input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Steps"
                          className="w-full h-11 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Value</label>
                        <input
                          type="number"
                          value={customValue}
                          onChange={(e) => setCustomValue(Number(e.target.value))}
                          placeholder="0"
                          className="w-full h-11 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--muted)">Unit</label>
                        <input
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value)}
                          placeholder="e.g. steps"
                          className="w-full h-11 rounded-xl border border-(--border) bg-(--card) px-4 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-(--border)/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-(--muted) hover:text-(--foreground) transition-colors"
                >
                  Reset
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-10 px-4 rounded-xl text-sm font-medium text-(--muted) hover:text-(--foreground) hover:bg-(--secondary) transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`h-10 px-6 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${selectedTypeConfig.bg}`}
                  >
                    Save Log
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(logsByDate).length > 0 ? (
            Object.entries(logsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateLogs]) => (
                <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-(--secondary) to-(--secondary)/50 text-(--muted) border border-(--border)">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
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
                    </div>
                    <span className="text-xs font-semibold bg-gradient-to-r from-(--primary)/10 to-blue-500/10 text-(--primary) px-3 py-1 rounded-full border border-(--primary)/20">
                      {dateLogs.length} {dateLogs.length === 1 ? "log" : "logs"}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dateLogs.map((log) => {
                      const config = typeConfig[log.type];
                      return (
                        <div
                          key={log.id}
                          className={`group relative rounded-2xl border bg-(--card) overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${config.border}`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-40`}
                          />
                          <div className={`absolute top-0 left-0 right-0 h-1 ${config.bg}`} />
                          <div className="relative p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${config.bg}/20 ${config.color} shadow-sm`}
                              >
                                {config.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold text-(--foreground)">
                                    {log.type === "water" && `${log.glasses} glass${log.glasses > 1 ? "es" : ""}`}
                                    {log.type === "gym" && log.workoutType}
                                    {log.type === "sleep" && `${Math.floor(log.sleepDurationMinutes / 60)}h ${log.sleepDurationMinutes % 60}m`}
                                    {log.type === "diet" && log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1)}
                                    {log.type === "custom" && log.name}
                                  </p>
                                  {log.type === "sleep" && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                                      log.quality === "excellent" ? "bg-green-500/20 text-green-600" :
                                      log.quality === "good" ? "bg-yellow-500/20 text-yellow-600" :
                                      "bg-red-500/20 text-red-600"
                                    }`}>
                                      {log.quality}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 space-y-1">
                                  {log.type === "water" && log.milliliters && (
                                    <p className="text-xs text-(--muted)">{log.milliliters} ml total</p>
                                  )}
                                  {log.type === "gym" && (
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="flex items-center gap-1 text-(--muted)">
                                        <Clock size={12} />
                                        {log.durationMinutes} min
                                      </span>
                                      {log.caloriesBurned && (
                                        <span className="flex items-center gap-1 text-red-500">
                                          <Flame size={12} />
                                          {log.caloriesBurned} cal
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {log.type === "sleep" && (
                                    <p className="text-xs text-(--muted)">
                                      {new Date(log.bedtime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                      {" to "}
                                      {new Date(log.wakeTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                    </p>
                                  )}
                                  {log.type === "diet" && (
                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-medium">
                                        {log.calories} cal
                                      </span>
                                      {log.protein && (
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                                          P: {log.protein}g
                                        </span>
                                      )}
                                      {log.carbs && (
                                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-medium">
                                          C: {log.carbs}g
                                        </span>
                                      )}
                                      {log.fat && (
                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                                          F: {log.fat}g
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {log.type === "custom" && (
                                    <p className="text-xs font-medium text-(--muted)">{log.value} {log.unit}</p>
                                  )}
                                </div>
                                {log.type === "gym" && log.notes && (
                                  <p className="text-xs text-(--muted) mt-2 line-clamp-2 italic">{log.notes}</p>
                                )}
                                {log.type === "diet" && log.description && (
                                  <p className="text-xs text-(--muted) mt-2 line-clamp-2 italic">{log.description}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteLog(log.id)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-(--muted) opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-(--border)/50">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                                {config.label}
                              </span>
                              <span className="text-[10px] text-(--muted)">
                                {new Date(log.date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
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
  totalFilteredLogs,
  typeCounts,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}: {
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (f: TypeFilter) => void;
  totalFilteredLogs: number;
  typeCounts: Record<HealthLogType, number>;
  customStartDate: string;
  setCustomStartDate: (v: string) => void;
  customEndDate: string;
  setCustomEndDate: (v: string) => void;
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
        <SidebarItem
          icon={<CalendarRange size={16} />}
          label="Custom Range"
          isActive={timeFilter === "custom"}
          onClick={() => setTimeFilter("custom")}
        />
      </SidebarSection>

      {timeFilter === "custom" && (
        <div className="space-y-3 px-1">
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1.5">Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-(--muted) mb-1.5">End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-(--secondary) border border-(--border) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50"
            />
          </div>
        </div>
      )}

      <SidebarSection title="Activity Type">
        <SidebarItem
          icon={<Activity size={16} />}
          label="All Types"
          count={totalFilteredLogs}
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
