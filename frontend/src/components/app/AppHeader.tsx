"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/auth";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  FolderKanban,
  CheckSquare,
  Layout,
  Heart,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/todos", label: "Todos", icon: CheckSquare },
  { href: "/board", label: "Board", icon: Layout },
  { href: "/health", label: "Health", icon: Heart },
];

export const AppHeader = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold text-base">
            H
          </div>
          <span className="text-lg font-semibold text-(--foreground) hidden sm:block">
            HabitFlow
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-(--primary)/10 text-(--primary)"
                    : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--card-hover) hover:text-(--foreground)"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <div className="hidden sm:block relative" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--card-hover)"
              onClick={() => setOpen((v) => !v)}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-(--primary) text-(--primary-foreground) text-xs font-bold">
                {initials}
              </div>
              <span className="max-w-[100px] truncate hidden md:block">
                {displayName}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform text-(--muted) ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-(--border) bg-(--card) py-1 shadow-lg">
                <div className="px-4 py-3 border-b border-(--border)">
                  <p className="text-sm font-medium text-(--foreground) truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-(--muted) truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-(--destructive) transition-colors hover:bg-(--card-hover)"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--card-hover) hover:text-(--foreground)"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-(--border) bg-(--card)">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-(--border)">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-(--primary) text-(--primary-foreground) font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--foreground) truncate">
                  {displayName}
                </p>
                <p className="text-xs text-(--muted) truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-(--primary)/10 text-(--primary)"
                        : "text-(--foreground) hover:bg-(--card-hover)"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-(--border) space-y-1">
              {mounted && (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-(--foreground) rounded-lg transition-colors hover:bg-(--card-hover)"
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
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-(--destructive) rounded-lg transition-colors hover:bg-(--card-hover)"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
