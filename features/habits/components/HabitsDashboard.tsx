"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";
import HabitQuickStats from "./HabitQuickStats";

export default function HabitsDashboard() {
  // ✅ Static placeholder values
  const stats = {
    totalHabits: 5,
    completedToday: 3,
    bestStreak: 7,
    completionRate: 60,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Habit Tracker</h1>
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

        {/* ✅ Static Stats */}
        <div className="mb-8">
          <HabitQuickStats
            totalHabits={stats.totalHabits}
            completedToday={stats.completedToday}
            bestStreak={stats.bestStreak}
            completionRate={stats.completionRate}
          />
        </div>

        {/* ✅ Placeholder Habit List (static UI, no logic) */}
        <div className="space-y-6">
          <HabitList />
        </div>

        {/* ✅ Bottom CTA (static) */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/30">
            All Day Check-in
          </Button>
          <div className="flex items-center text-lg">
            <span className="text-2xl mr-2">🔥</span>
            <span className="font-semibold text-slate-800">
              Your current streak is{" "}
              <span className="text-indigo-600">{stats.bestStreak} days</span>!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
