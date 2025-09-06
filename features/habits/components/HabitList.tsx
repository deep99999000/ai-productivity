"use client";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HabitCard from "./HabitCard";
import { useHabit } from "@/features/habits/HabitStore";
import HabitForm from "./HabitForm";

const todayISO = () => new Date().toISOString().slice(0,10);

export default function HabitList() {
  const { habits, filter, setFilter, checkins } = useHabit();

  const filtered = useMemo(() => {
    const iso = todayISO();
    if (filter === "archived") return habits.filter((h) => h.isArchived);
    if (filter === "active") return habits.filter((h) => !h.isArchived && !checkins[String(h.id)]?.[iso]);
    if (filter === "completed") return habits.filter((h) => checkins[String(h.id)]?.[iso]);
    return habits;
  }, [habits, filter, checkins]);

  return (
    <Card className="border-slate-200/80 bg-white/80 backdrop-blur">
      <CardHeader className="pb-4 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-900 dark:text-slate-100 text-xl">Habits Today</CardTitle>
          <CardDescription className="mt-1">Quick toggle your routines</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "active" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
          <HabitForm trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-2">
              New Habit
            </Button>
          } />
        </div>
      </CardHeader>
      <CardContent className="pt-4 grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length ? (
          filtered.map((h) => (
            <HabitCard key={h.id} habit={h as any} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-500">No habits to show.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
