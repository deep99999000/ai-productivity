"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";
import HabitQuickStats from "./HabitQuickStats";
import { useHabit } from "@/features/habits/HabitStore";
import { format } from "date-fns";
import { getAllUserHabits } from "@/features/habits/Habitaction";

interface HabitsDashboardProps {
  user_id: number;
}

export default function HabitsDashboard({ user_id }: HabitsDashboardProps) {
  const { allHabits, setHabits } = useHabit();

  const fetchHabits = async () => {
    if (!allHabits || allHabits.length === 0) {
      const habits = await getAllUserHabits(user_id);
      setHabits(habits ?? []);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [allHabits]);

  // Habit stats
  const completedToday = allHabits.filter((habit) =>
    habit.checkInDays?.includes(format(new Date(), "yyyy-MM-dd"))
  ).length;

  const bestStreak = allHabits
    .map((habit) => habit.highestStreak)
    .sort((a, b) => b - a)[0] ?? 0;

  const completionRate =
    allHabits.length > 0 ? (completedToday / allHabits.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Habit Tracker
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Stay consistent and build better habits.
            </p>
          </div>
          <HabitForm
            trigger={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5">
                New Habit
              </Button>
            }
          />
        </motion.header>

        {/* Quick Stats */}
        <div className="mb-8">
          <HabitQuickStats
            totalHabits={allHabits.length}
            completedToday={completedToday}
            bestStreak={bestStreak}
            completionRate={completionRate}
          />
        </div>

        {/* Habit List */}
        <div className="space-y-6">
          <HabitList />
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/30">
            All Day Check-in
          </Button>
          <div className="flex items-center text-lg">
            <span className="text-2xl mr-2">🔥</span>
            <span className="font-semibold text-slate-800">
              Your current streak is{" "}
              <span className="text-indigo-600">{bestStreak} days</span>!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
