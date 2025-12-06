"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, CheckCircle, Layout, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-(--border) pb-6">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] text-(--muted) font-medium">
              HabitFlow
            </p>
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-(--border) bg-(--card) text-(--foreground) transition-colors hover:bg-(--card-hover) focus-ring"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight max-w-md">
              One place for your todos, boards, and habits.
            </h1>
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="flex-1 sm:flex-none text-center rounded-lg border border-(--border) bg-(--card) px-4 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover) focus-ring"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="flex-1 sm:flex-none text-center rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) focus-ring"
              >
                Get started
              </a>
            </div>
          </div>
        </header>

        {/* Features */}
        <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6 transition-colors hover:bg-(--card-hover)">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--primary) text-(--primary-foreground)">
                <CheckCircle size={20} />
              </div>
              <h2 className="text-lg font-semibold text-(--foreground)">Todos</h2>
            </div>
            <p className="text-sm text-(--muted) leading-relaxed">
              Capture tasks, set due dates, and keep today and upcoming views
              tidy.
            </p>
          </div>
          <div className="group rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6 transition-colors hover:bg-(--card-hover)">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--accent) text-(--accent-foreground)">
                <Layout size={20} />
              </div>
              <h2 className="text-lg font-semibold text-(--foreground)">Boards</h2>
            </div>
            <p className="text-sm text-(--muted) leading-relaxed">
              Track work across Todo, Pending, and Completed with a clean
              kanban.
            </p>
          </div>
          <div className="group rounded-xl border border-(--border) bg-(--card) p-5 sm:p-6 transition-colors hover:bg-(--card-hover) sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--success) text-(--success-foreground)">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-semibold text-(--foreground)">Habits</h2>
            </div>
            <p className="text-sm text-(--muted) leading-relaxed">
              Log water, gym, and sleep, then watch your streak stay alive.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-(--border)">
          <p className="text-xs sm:text-sm text-(--muted) text-center">
            Built for productivity. Simple by design.
          </p>
        </footer>
      </div>
    </main>
  );
}
