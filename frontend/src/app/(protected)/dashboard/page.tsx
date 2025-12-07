"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  Layout,
  Activity,
  ArrowRight,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Clock,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "../../../store/auth";
import { useStreakStore } from "../../../store/streak";
import { useHealthStore } from "../../../store/health";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StreakCalendar } from "../../../components/ui/StreakCalendar";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";
  const { streak, fetchStreak, loading: streakLoading } = useStreakStore();
  const { logs, fetchLogs } = useHealthStore();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  useEffect(() => {
    fetchStreak();
    fetchLogs(); // Fetch all logs to get activity dates
  }, [fetchStreak, fetchLogs]);

  // Extract unique active dates from health logs
  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    logs.forEach((log) => {
      const date = new Date(log.date).toISOString().split("T")[0];
      dates.add(date);
    });
    return Array.from(dates);
  }, [logs]);

  // Count logs this week
  const logsThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return logs.filter((l) => new Date(l.date) >= weekAgo).length;
  }, [logs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-(--muted)">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-(--muted)">
          <Clock size={16} />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-(--border) bg-(--card) p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
              Tasks
            </span>
            <div className="p-1.5 rounded-lg bg-(--primary)/10">
              <CheckCircle size={14} className="text-(--primary)" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-(--foreground)">0</p>
          <p className="text-xs text-(--muted)">completed today</p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
              Projects
            </span>
            <div className="p-1.5 rounded-lg bg-(--accent)/10">
              <Layout size={14} className="text-(--accent)" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-(--foreground)">0</p>
          <p className="text-xs text-(--muted)">active boards</p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
              Streak
            </span>
            <div className="p-1.5 rounded-lg bg-(--warning)/10">
              <Zap size={14} className="text-(--warning)" />
            </div>
          </div>
          {streakLoading ? (
            <Skeleton className="mt-2 h-7 w-16" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-(--foreground)">
              {streak?.currentStreak ?? 0}
            </p>
          )}
          <p className="text-xs text-(--muted)">
            days active
            {streak?.longestStreak ? ` • longest ${streak.longestStreak}` : ""}
          </p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
              Health
            </span>
            <div className="p-1.5 rounded-lg bg-(--success)/10">
              <Activity size={14} className="text-(--success)" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-(--foreground)">{logsThisWeek}</p>
          <p className="text-xs text-(--muted)">logs this week</p>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StreakCalendar
          activeDates={activeDates}
          currentStreak={streak?.currentStreak ?? 0}
          longestStreak={streak?.longestStreak ?? 0}
          lastActiveDate={streak?.lastActiveDate ?? null}
          currentMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
        
        {/* Quick Tips */}
        <div className="rounded-xl border border-(--border) bg-(--card) p-4 sm:p-5">
          <h3 className="text-base font-semibold text-(--foreground) mb-4">Keep Your Streak Going</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-(--secondary)">
              <span className="text-xl">💧</span>
              <div>
                <p className="text-sm font-medium text-(--foreground)">Log your water intake</p>
                <p className="text-xs text-(--muted)">Stay hydrated throughout the day</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-(--secondary)">
              <span className="text-xl">🏋️</span>
              <div>
                <p className="text-sm font-medium text-(--foreground)">Track your workouts</p>
                <p className="text-xs text-(--muted)">Even a short walk counts!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-(--secondary)">
              <span className="text-xl">😴</span>
              <div>
                <p className="text-sm font-medium text-(--foreground)">Log your sleep</p>
                <p className="text-xs text-(--muted)">Aim for 7-9 hours per night</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-(--secondary)">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-medium text-(--foreground)">Complete tasks</p>
                <p className="text-xs text-(--muted)">Each completed task adds to your streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/todos"
          className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:border-(--primary)/50 hover:bg-(--card-hover)"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-(--primary) text-white">
              <CheckCircle size={22} />
            </div>
            <ArrowRight
              size={18}
              className="text-(--muted) transition-transform group-hover:translate-x-1 group-hover:text-(--primary)"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
            Todos
          </h2>
          <p className="mt-1 text-sm text-(--muted) leading-relaxed">
            Capture tasks, set priorities, and track your daily progress.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-(--muted)">
            <Calendar size={12} />
            <span>Organize by date & priority</span>
          </div>
        </Link>

        <Link
          href="/board"
          className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:border-(--accent)/50 hover:bg-(--card-hover)"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-(--accent) text-white">
              <Layout size={22} />
            </div>
            <ArrowRight
              size={18}
              className="text-(--muted) transition-transform group-hover:translate-x-1 group-hover:text-(--accent)"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
            Boards
          </h2>
          <p className="mt-1 text-sm text-(--muted) leading-relaxed">
            Manage projects with kanban-style boards and columns.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-(--muted)">
            <BarChart3 size={12} />
            <span>Visualize your workflow</span>
          </div>
        </Link>

        <Link
          href="/health"
          className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:border-(--success)/50 hover:bg-(--card-hover) sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-(--success) text-white">
              <Activity size={22} />
            </div>
            <ArrowRight
              size={18}
              className="text-(--muted) transition-transform group-hover:translate-x-1 group-hover:text-(--success)"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
            Health
          </h2>
          <p className="mt-1 text-sm text-(--muted) leading-relaxed">
            Track water intake, workouts, sleep, and build healthy habits.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-(--muted)">
            <TrendingUp size={12} />
            <span>Build streaks & habits</span>
          </div>
        </Link>
      </div>

      {/* Getting Started */}
      <div className="rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-(--secondary)">
            <Target size={18} className="text-(--foreground)" />
          </div>
          <div className="flex-1">
<h3 className="font-semibold text-(--foreground)">Get Started</h3>
            <p className="mt-1 text-sm text-(--muted)">
              Start by adding a task or logging a habit. Projects are optional
              and help when you want kanban boards.
            </p>
          </div>
        </div>
<div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link href="/todos?add=1" className="flex items-center gap-3 rounded-lg bg-(--secondary) p-3 hover:bg-(--card-hover) transition-colors">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--foreground) text-(--background) text-xs font-bold">1</div>
            <span className="text-sm text-(--foreground)">Add your first task</span>
          </Link>
          <Link href="/health?add=1&period=today" className="flex items-center gap-3 rounded-lg bg-(--secondary) p-3 hover:bg-(--card-hover) transition-colors">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--foreground) text-(--background) text-xs font-bold">2</div>
            <span className="text-sm text-(--foreground)">Log a habit today</span>
          </Link>
          <Link href="/projects?new=1&type=jira" className="flex items-center gap-3 rounded-lg bg-(--secondary) p-3 hover:bg-(--card-hover) transition-colors">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--foreground) text-(--background) text-xs font-bold">3</div>
            <span className="text-sm text-(--foreground)">Optional: Create a project (boards)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
