"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HabitCard from "./HabitCard";
import { useHabit } from "@/features/habits/HabitStore";


export default function HabitList() {
  const { allHabits } = useHabit();

  return (
    <Card className="border-slate-200/80 bg-white/80 backdrop-blur">
      <CardHeader className=" flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">
            Habits Today
          </CardTitle>
          <CardDescription className="mt-1">
            Quick toggle your routines
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className=" grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {allHabits.length ? (
          allHabits.map((h) => <HabitCard key={h.id} habit={h as any} />)
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-500">No habits to show.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
