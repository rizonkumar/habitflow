"use client";

import React from "react";

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
};

export function Chip({
  icon,
  active,
  className = "",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors select-none ${
        active
          ? "border-(--ring) bg-(--ring)/10 text-(--foreground)"
          : "border-(--border) bg-(--card) text-(--muted) hover:bg-(--card-hover)"
      } ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export default Chip;
