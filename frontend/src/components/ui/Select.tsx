"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface SelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  allowClear?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon,
  allowClear = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:bg-(--card-hover) min-w-[120px] justify-between ${
          selectedOption
            ? "border-(--primary) bg-(--primary)/5 text-(--primary)"
            : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon || selectedOption?.icon}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-full w-max max-w-[240px] rounded-xl border border-(--border) bg-(--card) p-1.5 shadow-xl animate-in">
          <div className="max-h-[240px] overflow-y-auto">
            {allowClear && value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
              >
                Clear selection
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  value === option.value
                    ? "bg-(--primary)/10 text-(--primary)"
                    : "text-(--foreground) hover:bg-(--card-hover)"
                }`}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                {option.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="truncate flex-1 text-left">{option.label}</span>
                {value === option.value && (
                  <Check size={14} className="shrink-0 text-(--primary)" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
