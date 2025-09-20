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
import type { Habit } from "@/features/habits/habitSchema";

import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { useHabit } from "@/features/habits/HabitStore";

export default function HabitCard({ habit }: { habit: Habit }) {
  const { toggleCheckin, deleteHabit } = useHabit();

  // week days (Mon–Sun)
  const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

  // get current week’s dates
  const weekDates = (() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((d) =>
      format(d, "yyyy-MM-dd")
    );
  })();

  // weekly completion %
  const weekCompletionPercentage =
    (weekDates.filter((date) => habit.checkInDays?.includes(date)).length *
      100) /
    weekDates.length;
  const today = format(new Date(), "yyyy-MM-dd");
  const isTodayChecked = habit.checkInDays?.includes(today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="group border-slate-200/60 hover:border-slate-300/80 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* top info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="text-3xl mt-1">{habit.emoji ?? "✅"}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 truncate">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                    {habit.description}
                  </p>
                )}
                <div className="mt-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                    {"daily"}
                  </span>
                </div>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200/50">
                <Flame className="h-3.5 w-3.5" />
                <span>{habit.highestStreak}</span>
                <span className="opacity-75">days</span>
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <HabitForm
                  defaultValues={{
                    id: habit.id,
                    name: habit.name,
                    description: habit.description ?? undefined,
                    emoji: habit.emoji ?? "✅",
                 
                  }}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  onClick={() => deleteHabit(habit.id as number)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* week view */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">
              {WEEK_DAYS.map((day, i) => (
                <span key={i} className="w-8 text-center">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date) =>
                habit.checkInDays?.includes(date) ? (
                  <span
                    key={date}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold"
                  >
                    {format(new Date(date), "d")}
                  </span>
                ) : (
                  <span
                    key={date}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs"
                  >
                    {format(new Date(date), "d")}
                  </span>
                )
              )}
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Week Progress:{" "}
              <span className="font-semibold text-emerald-600">
                {weekCompletionPercentage.toFixed(2)}%
              </span>
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>

          {/* check-in btn */}
          <div className="mt-5">
            {isTodayChecked ? (
              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5"
                onClick={() => toggleCheckin(habit.id as number, today)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Uncheck Today
              </Button>
            ) : (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5"
                onClick={() => toggleCheckin(habit.id as number, today)}
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
