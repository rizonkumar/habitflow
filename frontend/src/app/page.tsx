"use client";

import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  CheckCircle,
  Layout,
  Activity,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "../components/brand/Logo";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground) overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-(--primary) opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-(--accent) opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-(--success) opacity-10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col px-4 sm:px-6">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Logo size={22} />
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-(--border) bg-(--card) text-(--foreground) transition-all hover:bg-(--card-hover) hover:scale-105 focus-ring"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <a
              href="/login"
              className="hidden sm:flex text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="flex items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-all hover:bg-(--primary-hover) hover:gap-2.5 focus-ring"
            >
              Get started
              <ArrowRight size={14} />
            </a>
          </div>
        </nav>

        <section className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--border) bg-(--card) text-xs sm:text-sm text-(--muted) mb-6 animate-fade-in">
            <Zap size={14} className="text-(--warning)" />
            <span>Your productivity, simplified</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight max-w-3xl mb-6">
            Build better habits.
            <br />
            <span className="bg-gradient-to-r from-(--primary) via-(--accent) to-(--success) bg-clip-text text-transparent">
              Achieve more daily.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-(--muted) max-w-xl mb-8 leading-relaxed">
            The all-in-one workspace for todos, kanban boards, and habit
            tracking. Stay focused, stay consistent, stay productive.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-medium text-(--primary-foreground) transition-all hover:bg-(--primary-hover) hover:scale-105 hover:shadow-lg hover:shadow-(--primary)/20 focus-ring"
            >
              Start for free
              <ArrowRight size={18} />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-(--border) bg-(--card) px-6 py-3 text-base font-medium text-(--foreground) transition-all hover:bg-(--card-hover) hover:scale-105 focus-ring"
            >
              Log in
            </a>
          </div>
        </section>

        {/* App Preview */}
        <section className="relative mb-20">
          <div className="absolute inset-0 bg-gradient-to-t from-(--background) via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border border-(--border) bg-(--card) p-2 shadow-2xl shadow-(--foreground)/5">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-(--border)">
              <div className="w-3 h-3 rounded-full bg-(--destructive) opacity-80" />
              <div className="w-3 h-3 rounded-full bg-(--warning) opacity-80" />
              <div className="w-3 h-3 rounded-full bg-(--success) opacity-80" />
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="rounded-xl bg-(--background) p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-(--primary)" />
                  <span className="text-xs font-medium">Todo</span>
                  <span className="text-xs text-(--muted) ml-auto">3</span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5">
                    <p className="text-xs font-medium mb-1">Design review</p>
                    <p className="text-[10px] text-(--muted)">Due today</p>
                  </div>
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5">
                    <p className="text-xs font-medium mb-1">Update docs</p>
                    <p className="text-[10px] text-(--muted)">Tomorrow</p>
                  </div>
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5 opacity-60">
                    <p className="text-xs font-medium">Plan sprint</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-(--background) p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-(--warning)" />
                  <span className="text-xs font-medium">In Progress</span>
                  <span className="text-xs text-(--muted) ml-auto">2</span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5">
                    <p className="text-xs font-medium mb-1">Build landing</p>
                    <div className="w-full h-1 rounded-full bg-(--border) mt-2">
                      <div className="w-3/4 h-full rounded-full bg-(--primary)" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5">
                    <p className="text-xs font-medium">API integration</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-(--background) p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-(--success)" />
                  <span className="text-xs font-medium">Done</span>
                  <span className="text-xs text-(--muted) ml-auto">5</span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5 opacity-60">
                    <p className="text-xs font-medium line-through">
                      Setup project
                    </p>
                  </div>
                  <div className="rounded-lg bg-(--card) border border-(--border) p-2.5 opacity-60">
                    <p className="text-xs font-medium line-through">
                      Auth flow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Everything you need
            </h2>
            <p className="text-(--muted) max-w-md mx-auto">
              Three powerful tools, one seamless experience.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-2xl border border-(--border) bg-(--card) p-6 transition-all hover:bg-(--card-hover) hover:border-(--primary)/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-(--primary)/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-(--primary)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--primary)/10 text-(--primary) mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Todos</h3>
                <p className="text-sm text-(--muted) leading-relaxed mb-4">
                  Capture tasks instantly, set priorities and due dates. Stay on
                  top with Today and Upcoming views.
                </p>
                <div className="flex items-center gap-4 text-xs text-(--muted)">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> Priorities
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} /> Due dates
                  </span>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl border border-(--border) bg-(--card) p-6 transition-all hover:bg-(--card-hover) hover:border-(--accent)/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-(--accent)/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-(--accent)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--accent)/10 text-(--accent) mb-4 group-hover:scale-110 transition-transform">
                  <Layout size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Kanban Boards</h3>
                <p className="text-sm text-(--muted) leading-relaxed mb-4">
                  Visualize your workflow with drag-and-drop boards. Move tasks
                  through Todo, In Progress, and Done.
                </p>
                <div className="flex items-center gap-4 text-xs text-(--muted)">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> Drag & drop
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} /> Visual flow
                  </span>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl border border-(--border) bg-(--card) p-6 transition-all hover:bg-(--card-hover) hover:border-(--success)/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-(--success)/5 sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-(--success)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-(--success)/10 text-(--success) mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Habit Tracking</h3>
                <p className="text-sm text-(--muted) leading-relaxed mb-4">
                  Build lasting habits with daily tracking. Log water, workouts,
                  sleep, and watch your streaks grow.
                </p>
                <div className="flex items-center gap-4 text-xs text-(--muted)">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> Streaks
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} /> Analytics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative rounded-2xl border border-(--border) bg-(--card) p-8 sm:p-12 mb-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-(--primary) opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-(--accent) opacity-5 rounded-full blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to flow?
            </h2>
            <p className="text-(--muted) max-w-md mx-auto mb-6">
              Join others building better habits and crushing their goals.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-8 py-3.5 text-base font-medium text-(--primary-foreground) transition-all hover:bg-(--primary-hover) hover:scale-105 hover:shadow-lg hover:shadow-(--primary)/20 focus-ring"
            >
              Get started — it&apos;s free
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

        <footer className="border-t border-(--border) py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-(--primary) text-(--primary-foreground)">
                <Sparkles size={12} />
              </div>
              <span className="text-sm font-medium">HabitFlow</span>
            </div>
            <p className="text-xs text-(--muted)">
              Built for productivity. Simple by design.
            </p>
            <div className="flex items-center gap-2 text-xs text-(--muted)">
              <span>
                Created by{" "}
                <span className="text-(--foreground) font-medium">
                  Rizon Kumar Rahi
                </span>
              </span>
              <a
                href="https://x.com/RizonKumar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-(--border) bg-(--card) text-(--foreground) transition-colors hover:bg-(--card-hover)"
                aria-label="Creator on X"
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
