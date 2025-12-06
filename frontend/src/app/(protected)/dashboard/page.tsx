"use client";

import { CheckCircle, Layout, Activity, Sparkles } from "lucide-react";
import { useAuthStore } from "../../../store/auth";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--primary)/10 text-(--primary)">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-(--foreground)">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-(--muted)">
              This is your workspace. Switch between Todos, Board, and Health as features come online.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-colors hover:bg-(--card-hover)">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary) text-(--primary-foreground)">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-(--foreground)">Todos</h2>
          </div>
          <p className="text-sm text-(--muted) leading-relaxed">
            Capture tasks, set due dates, and stay organized.
          </p>
          <div className="mt-4 pt-4 border-t border-(--border)">
            <span className="text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Coming soon</span>
          </div>
        </div>

        <div className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-colors hover:bg-(--card-hover)">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--accent) text-(--accent-foreground)">
              <Layout size={20} />
            </div>
            <h2 className="text-lg font-semibold text-(--foreground)">Boards</h2>
          </div>
          <p className="text-sm text-(--muted) leading-relaxed">
            Track work across kanban-style columns.
          </p>
          <div className="mt-4 pt-4 border-t border-(--border)">
            <span className="text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Coming soon</span>
          </div>
        </div>

        <div className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-colors hover:bg-(--card-hover) sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--success) text-(--success-foreground)">
              <Activity size={20} />
            </div>
            <h2 className="text-lg font-semibold text-(--foreground)">Habits</h2>
          </div>
          <p className="text-sm text-(--muted) leading-relaxed">
            Log water, gym, and sleep to build streaks.
          </p>
          <div className="mt-4 pt-4 border-t border-(--border)">
            <span className="text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6">
        <h3 className="text-base font-semibold text-(--foreground) mb-3">Quick tips</h3>
        <ul className="space-y-2 text-sm text-(--muted)">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--primary)"></span>
            Use the theme toggle to switch between light and dark mode
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--accent)"></span>
            More features are on the way - stay tuned!
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--success)"></span>
            Build daily habits to boost your productivity
          </li>
        </ul>
      </div>
    </div>
  );
}
