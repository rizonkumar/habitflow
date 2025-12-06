"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/auth";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Moon, Sun, UserRound, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export const AppHeader = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--card)">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--primary) text-(--primary-foreground) font-bold text-sm">
            H
          </div>
          <span className="text-lg font-semibold text-(--foreground) hidden sm:block">HabitFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle */}
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

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover) focus-ring"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--primary) text-(--primary-foreground) text-xs font-bold">
                {initials}
              </div>
              <span className="max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-(--border) bg-(--card) py-1 shadow-lg">
                <div className="px-4 py-2 border-b border-(--border)">
                  <p className="text-sm font-medium text-(--foreground) truncate">{displayName}</p>
                  <p className="text-xs text-(--muted) truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-(--destructive) transition-colors hover:bg-(--card-hover)"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-(--border) bg-(--card) text-(--foreground) transition-colors hover:bg-(--card-hover)"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-(--border) bg-(--card) px-4 py-3">
          <div className="flex items-center gap-3 pb-3 border-b border-(--border)">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-(--primary) text-(--primary-foreground) font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--foreground) truncate">{displayName}</p>
              <p className="text-xs text-(--muted) truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 pt-3">
            {mounted && (
              <button
                type="button"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-(--foreground) rounded-lg transition-colors hover:bg-(--card-hover)"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setMobileMenuOpen(false);
                }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-(--destructive) rounded-lg transition-colors hover:bg-(--card-hover)"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
