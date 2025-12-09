"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/auth";
import {
  Loader2,
  ArrowRight,
  Moon,
  Sun,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "../../../components/brand/Logo";

function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-(--background) flex flex-col animate-pulse">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="h-4 w-12 rounded bg-(--secondary)" />
        <div className="w-9 h-9 rounded-lg bg-(--secondary)" />
      </div>

      <div className="flex justify-center pt-4">
        <div className="h-8 w-28 rounded bg-(--secondary)" />
      </div>

      <div className="flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-md rounded-xl border border-(--border) bg-(--card) p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="h-8 w-40 mx-auto mb-3 rounded bg-(--secondary)" />
            <div className="h-4 w-56 mx-auto rounded bg-(--secondary)" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-4 w-12 rounded bg-(--secondary)" />
              <div className="h-11 w-full rounded-lg bg-(--secondary)" />
            </div>

            <div className="space-y-1.5">
              <div className="h-4 w-16 rounded bg-(--secondary)" />
              <div className="h-11 w-full rounded-lg bg-(--secondary)" />
            </div>

            <div className="h-11 w-full rounded-lg bg-(--secondary)" />

            <div className="h-4 w-48 mx-auto rounded bg-(--secondary)" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, status, error } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (!mounted) {
    return <LoginSkeleton />;
  }

  return (
    <div className="min-h-screen bg-(--background) flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-(--muted) hover:text-(--foreground) transition-colors"
        >
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

      <div className="flex justify-center pt-4">
        <Logo size={22} />
      </div>

      <div className="flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-md rounded-xl border border-(--border) bg-(--card) p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1.5 text-sm text-(--muted)">
              Log in to your HabitFlow workspace.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
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
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-(--input-border) bg-(--input) pl-10 pr-10 py-2.5 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none transition-colors focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--foreground)"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(localError || error) && (
              <div className="rounded-lg bg-(--destructive)/10 border border-(--destructive)/20 px-3 py-2">
                <p className="text-sm text-(--destructive)">
                  {localError || error}
                </p>
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

            <p className="text-sm text-(--muted) text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-(--primary) hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}