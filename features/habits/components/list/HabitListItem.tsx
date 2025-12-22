"use client";

import React from "react";
import { Zap, Flame, Check } from "lucide-react";
import type { Habit } from "@/features/habits/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useHabit } from "@/features/habits/store";
import { toggleCheckInHabitAction } from "@/features/habits/actions";

interface HabitListItemProps {
  habit: Habit;
  isSelected: boolean;
  onSelect: (habit: Habit) => void;
  viewMode: "grid" | "list";
  selectedDate: Date;
}

export default function HabitListItem({
  habit,
  isSelected,
  onSelect,
  viewMode,
  selectedDate,
}: HabitListItemProps) {
  const { toggleCheckin } = useHabit();

  // Get color based on habit name
  const getColorClasses = (str: string) => {
    const colors = [
      { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
      { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
      { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200" },
      { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
      { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
      { bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200" },
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClasses = getColorClasses(habit.name);

  // Calculate current streak
  const computeCurrentStreak = (days: string[] | undefined): number => {
    if (!days || days.length === 0) return 0;
    const set = new Set(days);
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      if (set.has(iso)) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const currentStreak = computeCurrentStreak(habit.checkInDays ?? undefined);
  const totalCheckIns = habit.checkInDays?.length ?? 0;
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isDateChecked = habit.checkInDays?.includes(selectedDateStr);

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCheckin(habit.id as number, selectedDateStr);
    await toggleCheckInHabitAction(habit.id, selectedDateStr);
  };

  if (viewMode === "grid") {
    return (
      <div
        onClick={() => onSelect(habit)}
        className={cn(
          "relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 bg-white hover:shadow-md",
          isSelected
            ? "border-blue-200 shadow-md ring-1 ring-blue-100"
            : "border-gray-100 hover:border-gray-200"
        )}
      >
        {/* Icon and content */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0",
              colorClasses.bg
            )}
          >
            {habit.emoji || "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate pr-6">
              {habit.name}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>{totalCheckIns} Days</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Flame
                  className={cn(
                    "h-3 w-3",
                    currentStreak > 0 ? "text-orange-500" : "text-gray-300"
                  )}
                />
                <span>{currentStreak} Day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Check button */}
        <button
          onClick={handleCheckIn}
          className={cn(
            "absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center transition-all",
            isDateChecked
              ? "bg-blue-500 text-white"
              : "border-2 border-gray-200 hover:border-blue-400"
          )}
        >
          {isDateChecked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        </button>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={() => onSelect(habit)}
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg",
        isSelected && "bg-blue-50"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full text-lg flex-shrink-0",
          colorClasses.bg
        )}
      >
        {habit.emoji || "📝"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm">{habit.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Zap className="h-3 w-3 text-blue-500" />
            <span>{totalCheckIns} Days</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Flame
              className={cn(
                "h-3 w-3",
                currentStreak > 0 ? "text-orange-500" : "text-gray-300"
              )}
            />
            <span>{currentStreak} Day</span>
          </div>
        </div>
      </div>

      {/* Check button */}
      <button
        onClick={handleCheckIn}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0",
          isDateChecked
            ? "bg-blue-500 text-white"
            : "border-2 border-gray-200 hover:border-blue-400"
        )}
      >
        {isDateChecked && <Check className="h-4 w-4" strokeWidth={2.5} />}
      </button>
    </div>
  );
}
