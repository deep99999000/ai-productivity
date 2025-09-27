"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HabitCard from "./HabitCard";
import { useHabit } from "@/features/habits/utils/HabitStore";


export default function HabitList() {
  const { allHabits } = useHabit();
  return (
    <Card className="border-slate-200/80 bg-white/80 backdrop-blur shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Your Habits
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            {allHabits.length > 0 
              ? `${allHabits.length} habit${allHabits.length === 1 ? '' : 's'} to track today`
              : "Start building your first habit"
            }
          </CardDescription>
        </div>
        {allHabits.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 bg-slate-100 rounded-full">
              {allHabits.filter(h => h.checkInDays?.includes(new Date().toISOString().slice(0, 10))).length} completed
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {allHabits.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {allHabits.map((h) => <HabitCard key={h.id} habit={h as any} />)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-slate-500 mb-2 font-medium">No habits yet</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Create your first habit to start building a consistent routine that will transform your daily life.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
