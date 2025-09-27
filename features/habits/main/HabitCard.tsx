"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame,
  RotateCcw,
  Edit,
  Trash2,
  Check,
  TrendingUp,
} from "lucide-react";
import HabitForm from "./HabitForm";
import type { Habit } from "@/features/habits/utils/habitSchema";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { useHabit } from "@/features/habits/utils/HabitStore";
import {
  deletehabitaction,
  toggleCheckInHabitAction,
} from "@/features/habits/utils/Habitaction";

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const { toggleCheckin, deleteHabit } = useHabit();

  // Week days labels
  const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

  // Current week dates
  const weekDates = (() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((d) =>
      format(d, "yyyy-MM-dd")
    );
  })();

  // Weekly completion %
  const weekCompletionPercentage =
    (weekDates.filter((date) => habit.checkInDays?.includes(date)).length *
      100) /
    weekDates.length;

  const today = format(new Date(), "yyyy-MM-dd");
  const isTodayChecked = habit.checkInDays?.includes(today);

  const handleDeleteHabit = async () => {
    deleteHabit(habit.id);
    await deletehabitaction(habit.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="group border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 bg-white/90 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="px-4 sm: relative">
          {/* Top info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="text-2xl sm:text-3xl mt-1 p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors duration-200">
                {habit.emoji ?? "✅"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 truncate pr-2">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {habit.description}
                  </p>
                )}
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/50">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    daily
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 text-xs font-semibold border border-orange-200/50 shadow-sm">
                <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{habit.highestStreak || 0}</span>
                <span className="opacity-75 hidden sm:inline">days</span>
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <HabitForm
                  defaultValues={{
                    id: habit.id,
                    name: habit.name,
                    description: habit.description ?? undefined,
                    emoji: habit.emoji ?? "✅",
                    frequency: "daily",
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 hover:scale-105 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all"
                  onClick={handleDeleteHabit}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Week view */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
              {WEEK_DAYS.map((day, i) => (
                <span key={i} className="w-7 sm:w-8 text-center">
                  {day}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDates.map((date) => {
                const checked = habit.checkInDays?.includes(date);
                const isToday = date === today;
                return (
                  <span
                    key={date}
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                      checked
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        : isToday
                        ? "bg-slate-200 text-slate-600 ring-2 ring-indigo-300 ring-opacity-60"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {format(new Date(date), "d")}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Check-in button */}
          <div className="mt-5">
            {isTodayChecked ? (
              <Button
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-lg shadow-rose-500/25 transition-all duration-200 hover:scale-[1.02]"
                onClick={async () => {
                  toggleCheckin(habit.id as number, today);
                  await toggleCheckInHabitAction(habit.id, today);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Uncheck Today
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02]"
                onClick={async () => {
                  toggleCheckin(habit.id as number, today);
                  await toggleCheckInHabitAction(habit.id, today);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Check In Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
