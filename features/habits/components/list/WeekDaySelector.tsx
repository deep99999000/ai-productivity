"use client";

import React, { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Habit } from "@/features/habits/schema";
import { Check } from "lucide-react";

interface WeekDaySelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  habits: Habit[];
}

export default function WeekDaySelector({
  selectedDate,
  onDateSelect,
  habits,
}: WeekDaySelectorProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const currentWeekDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 6 });
  const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn: 6 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getDayCompletion = (date: Date): number => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (habits.length === 0) return 0;
    const completed = habits.filter((h) =>
      h.checkInDays?.includes(dateStr)
    ).length;
    return (completed / habits.length) * 100;
  };

  return (
    <div className="flex items-center justify-between py-2 px-2">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const completion = getDayCompletion(day);
        const dayName = format(day, "EEE");
        const dayNum = format(day, "d");
        const isComplete = completion === 100;

        return (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all min-w-[46px]",
              isSelected && "bg-blue-500 shadow-md"
            )}
          >
            <span
              className={cn(
                "text-[11px] font-medium",
                isSelected ? "text-white" : isToday ? "text-blue-600" : "text-slate-400"
              )}
            >
              {dayName}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isSelected ? "text-white" : isToday ? "text-blue-600" : "text-slate-700"
              )}
            >
              {dayNum}
            </span>
            {/* Progress circle */}
            <div className="relative w-7 h-7 mt-0.5">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  fill="none"
                  stroke={isSelected ? "rgba(255,255,255,0.3)" : "#f1f5f9"}
                  strokeWidth="2"
                />
                {completion > 0 && (
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    fill="none"
                    stroke={isSelected ? "#ffffff" : "#3b82f6"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${(completion / 100) * 69.115} 69.115`}
                    className="transition-all duration-300"
                  />
                )}
              </svg>
              {isComplete && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    isSelected ? "bg-white" : "bg-blue-500"
                  )}>
                    <Check className={cn(
                      "w-2.5 h-2.5",
                      isSelected ? "text-blue-500" : "text-white"
                    )} strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
