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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-(--muted)">
        <Filter size={14} />
        <span>Filter</span>
      </div>

      <div className="flex items-center gap-1">
        {visibleMembers.map((member) => {
          const isSelected = selectedIds.includes(member.userId);
          return (
            <div key={member.userId} className="relative group">
              <button
                onClick={() => onToggle(member.userId)}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-all ${
                  isSelected
                    ? "bg-(--primary) text-(--primary-foreground) border-(--primary) scale-110 z-10"
                    : hasFilter && !isSelected
                    ? "bg-(--secondary) text-(--muted) border-transparent opacity-40 hover:opacity-100"
                    : "bg-(--primary)/10 text-(--primary) border-transparent hover:border-(--primary)/50"
                }`}
              >
                {getInitials(member.name)}
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-lg">
                {member.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
              </div>
            </div>
          );
        })}

        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-(--secondary) text-(--muted) hover:text-(--foreground) border-2 border-transparent transition-all"
            title={`Show ${hiddenCount} more`}
          >
            +{hiddenCount}
          </button>
        )}

        {showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-(--secondary) text-(--muted) hover:text-(--foreground) border-2 border-transparent transition-all"
            title="Show less"
          >
            <ChevronDown size={14} className="rotate-180" />
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-(--border)" />

      <button
        onClick={() => onToggle("unassigned")}
        title="Unassigned tasks"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          selectedIds.includes("unassigned")
            ? "bg-(--muted) text-(--foreground) border-(--muted)"
            : "bg-(--secondary) text-(--muted) border-transparent hover:text-(--foreground) hover:border-(--border)"
        }`}
      >
        <UserCircle size={14} />
        Unassigned
      </button>

      {hasFilter && (
        <>
          <div className="w-px h-6 bg-(--border)" />
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-(--destructive)/10 text-(--destructive) hover:bg-(--destructive)/20 transition-colors"
          >
            <X size={14} />
            Clear ({selectedIds.length})
          </button>
        </>
      )}
    </div>
  );
}
