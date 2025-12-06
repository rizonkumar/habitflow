"use client";

import { useState } from "react";
import { useAuthStore } from "../../store/auth";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

export const AppHeader = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const displayName = user?.name || user?.email || "User";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 shadow-sm">
      <div className="text-lg font-semibold">HabitFlow</div>
      <div className="relative">
        <button
          type="button"
          className="cursor-pointer rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <UserRound size={16} />
            {displayName}
            <ChevronDown size={14} />
          </span>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-md border border-zinc-200 bg-white shadow-lg">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
