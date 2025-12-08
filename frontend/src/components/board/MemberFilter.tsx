"use client";

import { useState } from "react";
import type { ProjectMember } from "../../types/api";
import { X, UserCircle, Filter, ChevronDown } from "lucide-react";

type MemberFilterProps = {
  members: ProjectMember[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  onClear: () => void;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function MemberFilter({
  members,
  selectedIds,
  onToggle,
  onClear,
}: MemberFilterProps) {
  const [showAll, setShowAll] = useState(false);

  if (members.length <= 1) return null;

  const hasFilter = selectedIds.length > 0;
  const visibleMembers = showAll ? members : members.slice(0, 5);
  const hiddenCount = members.length - 5;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-(--secondary)/50 border border-(--border)">
      <div className="flex items-center gap-2 text-xs font-medium text-(--muted)">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-(--card) shadow-sm">
          <Filter size={12} />
        </div>
        <span className="hidden sm:inline">Filter</span>
      </div>

      <div className="flex items-center gap-1.5">
        {visibleMembers.map((member) => {
          const isSelected = selectedIds.includes(member.userId);
          return (
            <div key={member.userId} className="relative group">
              <button
                onClick={() => onToggle(member.userId)}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-(--primary) to-blue-600 text-(--primary-foreground) border-(--primary) scale-110 z-10 shadow-lg shadow-(--primary)/30"
                    : hasFilter && !isSelected
                    ? "bg-(--secondary) text-(--muted) border-transparent opacity-40 hover:opacity-100"
                    : "bg-gradient-to-br from-(--primary)/10 to-(--accent)/10 text-(--primary) border-transparent hover:border-(--primary)/50 hover:shadow-md"
                }`}
              >
                {getInitials(member.name)}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
                {member.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
              </div>
            </div>
          );
        })}

        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold bg-(--card) text-(--muted) hover:text-(--foreground) border-2 border-dashed border-(--border) hover:border-(--primary)/50 transition-all"
            title={`Show ${hiddenCount} more`}
          >
            +{hiddenCount}
          </button>
        )}

        {showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-(--card) text-(--muted) hover:text-(--foreground) border-2 border-(--border) transition-all"
            title="Show less"
          >
            <ChevronDown size={14} className="rotate-180" />
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-(--border) hidden sm:block" />

      <button
        onClick={() => onToggle("unassigned")}
        title="Unassigned tasks"
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
          selectedIds.includes("unassigned")
            ? "bg-gradient-to-r from-slate-500/20 to-gray-500/20 text-(--foreground) border-slate-400/50"
            : "bg-(--card) text-(--muted) border-transparent hover:text-(--foreground) hover:border-(--border)"
        }`}
      >
        <UserCircle size={14} />
        <span className="hidden sm:inline">Unassigned</span>
      </button>

      {hasFilter && (
        <>
          <div className="w-px h-6 bg-(--border) hidden sm:block" />
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500 border-2 border-red-500/20 hover:border-red-500/40 transition-all"
          >
            <X size={14} />
            <span className="hidden sm:inline">Clear</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-[10px] font-semibold">
              {selectedIds.length}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
