"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, addDays, nextSaturday, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { Calendar, Sun, ArrowRight, CalendarDays, X, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

const presets = [
  {
    label: "Today",
    icon: Calendar,
    getValue: () => new Date(),
  },
  {
    label: "Tomorrow",
    icon: Sun,
    getValue: () => addDays(new Date(), 1),
  },
  {
    label: "This Weekend",
    icon: ArrowRight,
    getValue: () => nextSaturday(new Date()),
  },
  {
    label: "Next Week",
    icon: CalendarDays,
    getValue: () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
  },
];

export function DatePicker({ value, onChange, placeholder = "Due date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const dateValue = value ? (typeof value === "string" ? new Date(value + "T00:00:00") : value) : undefined;

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

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:bg-(--card-hover) ${
          dateValue
            ? "border-(--primary) bg-(--primary)/5 text-(--primary)"
            : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
        }`}
      >
        <Calendar size={15} />
        <span>{dateValue ? format(dateValue, "MMM d") : placeholder}</span>
        {dateValue && (
          <span
            role="button"
            onClick={clearDate}
            className="ml-0.5 rounded-full p-0.5 hover:bg-(--primary)/20"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-(--border) bg-(--card) shadow-xl animate-in">
          {/* Presets */}
          <div className="border-b border-(--border) p-3">
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((preset) => {
                const PresetIcon = preset.icon;
                const presetDate = preset.getValue();
                const isActive = dateValue && isSameDay(dateValue, presetDate);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelect(presetDate)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-(--primary)/10 text-(--primary) font-medium"
                        : "text-(--foreground) hover:bg-(--card-hover)"
                    }`}
                  >
                    <PresetIcon size={15} className={isActive ? "text-(--primary)" : "text-(--muted)"} />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              showOutsideDays
              fixedWeeks
              components={{
                Chevron: ({ orientation }) => 
                  orientation === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
              }}
              classNames={{
                root: "w-full",
                months: "w-full",
                month: "w-full space-y-3",
                month_caption: "flex justify-center items-center relative h-8",
                caption_label: "text-sm font-semibold text-(--foreground)",
                nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                button_previous: "h-8 w-8 flex items-center justify-center rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors",
                button_next: "h-8 w-8 flex items-center justify-center rounded-lg text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover) transition-colors",
                month_grid: "w-full border-collapse",
                weekdays: "flex w-full",
                weekday: "flex-1 text-center text-(--muted) text-xs font-medium py-2",
                week: "flex w-full",
                day: "flex-1 flex items-center justify-center p-0.5",
                day_button: "w-full aspect-square rounded-lg text-sm transition-colors hover:bg-(--card-hover) flex items-center justify-center",
                selected: "[&>button]:bg-(--primary) [&>button]:text-(--primary-foreground) [&>button]:hover:bg-(--primary) [&>button]:font-medium",
                today: "[&>button]:bg-(--secondary) [&>button]:font-semibold",
                outside: "[&>button]:text-(--muted) [&>button]:opacity-40",
                disabled: "[&>button]:text-(--muted) [&>button]:opacity-30 [&>button]:cursor-not-allowed",
              }}
            />
          </div>

          {/* Clear button */}
          {dateValue && (
            <div className="border-t border-(--border) p-2">
              <button
                type="button"
                onClick={() => handleSelect(undefined)}
                className="w-full rounded-lg px-3 py-2 text-sm text-(--muted) hover:text-(--destructive) hover:bg-(--destructive)/10 transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
