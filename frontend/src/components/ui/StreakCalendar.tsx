"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

type StreakCalendarProps = {
  activeDates: string[]; // Additional active dates from logs
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function StreakCalendar({
  activeDates,
  currentStreak,
  longestStreak,
  lastActiveDate,
  currentMonth,
  onMonthChange,
}: StreakCalendarProps) {
  // Util: format to YYYY-MM-DD in local time (avoids UTC off-by-one)
  const keyOf = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Compute active dates from streak data (prefer today if lastActiveDate is stale)
  const activeDateSet = useMemo(() => {
    const dates = new Set<string>();

    // Union in any additional explicit active dates
    for (const ds of activeDates) dates.add(ds);

    // Determine anchor end date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let endDate = lastActiveDate ? new Date(lastActiveDate) : today;
    endDate.setHours(0, 0, 0, 0);

    // If the lastActiveDate is older than 3 days from today (or in the future),
    // assume the streak is reported relative to today.
    const diffDays = Math.floor((today.getTime() - endDate.getTime()) / (24 * 3600 * 1000));
    if (!lastActiveDate || diffDays > 3 || endDate > today) {
      endDate = today;
    }

    // Add contiguous streak dates from endDate backwards
    for (let i = 0; i < Math.max(0, currentStreak); i++) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - i);
      dates.add(keyOf(d));
    }

    return dates;
  }, [activeDates, lastActiveDate, currentStreak]);

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: { date: Date | null; isActive: boolean; isToday: boolean; isFuture: boolean }[] = [];
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isActive: false, isToday: false, isFuture: false });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = keyOf(today);
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = keyOf(date);
      const isActive = activeDateSet.has(dateStr);
      const isToday = dateStr === todayStr;
      const isFuture = date > today;
      days.push({ date, isActive, isToday, isFuture });
    }
    
    return days;
  }, [currentMonth, activeDateSet]);

  const goToPrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const monthName = MONTHS[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  // Count active days in current month
  const activeThisMonth = calendarData.filter(d => d.isActive).length;

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-500" />
          <h3 className="text-base font-semibold text-(--foreground)">Activity</h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-md text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-(--foreground) min-w-[100px] text-center">
            {monthName.slice(0, 3)} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-md text-(--muted) hover:bg-(--card-hover) hover:text-(--foreground) transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="text-center text-[10px] font-medium text-(--muted) py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((item, idx) => {
          if (!item.date) {
            return <div key={`empty-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9" />;
          }

          const dayNum = item.date.getDate();

          return (
            <div
              key={dayNum}
              className={`
                w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all
                ${item.isToday ? "ring-2 ring-(--primary) ring-offset-1 ring-offset-(--card)" : ""}
                ${item.isFuture 
                  ? "text-(--muted-foreground) opacity-40" 
                  : item.isActive 
                    ? "bg-green-500 text-white" 
                    : "text-(--muted) hover:bg-(--card-hover)"
                }
              `}
              title={item.isActive ? "Active day" : item.isFuture ? "Future" : "No activity"}
            >
              {item.isActive && !item.isFuture ? (
                <span className="text-sm">😊</span>
              ) : (
                dayNum
              )}
            </div>
          );
        })}
      </div>

      {/* Streak Stats */}
      <div className="mt-4 pt-3 border-t border-(--border) flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-orange-500" />
            <span className="text-sm font-bold text-(--foreground)">{currentStreak}</span>
            <span className="text-xs text-(--muted)">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-bold text-(--foreground)">{longestStreak}</span>
            <span className="text-xs text-(--muted)">Max</span>
          </div>
        </div>
        <div className="text-xs text-(--muted)">
          {activeThisMonth} days this month
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-(--muted)">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 flex items-center justify-center text-[8px]">😊</span>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-(--secondary)"></span>
          <span>No activity</span>
        </div>
      </div>
    </div>
  );
}
