"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import { Loader2, ArrowRight, Moon, Sun, Mail, Lock } from "lucide-react";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const router = useRouter();
  const { login, status, error } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--background) px-4">
      {/* Top bar with theme toggle */}
      <div className="flex justify-between items-center p-4 sm:p-6">
        <Link href="/" className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors">
          ← Back
        </Link>
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

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-md rounded-xl border border-(--border) bg-(--card) p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-(--foreground)">Welcome back</h1>
            <p className="mt-1.5 text-sm text-(--muted)">
              Log in to access your HabitFlow workspace.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--foreground)">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-10 pr-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--foreground)">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-10 pr-3 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {(localError || error) && (
              <div className="rounded-lg bg-(--destructive)/10 border border-(--destructive)/20 px-3 py-2">
                <p className="text-sm text-(--destructive)">{localError || error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60 focus-ring"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Logging in...
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-(--muted) text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-(--primary) hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
