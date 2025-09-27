"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Flame,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import Loading from "@/components/Loading";
import { StatCard } from "@/components/StateCard";

import type { Habit, NewHabit } from "@/features/habits/utils/habitSchema";
import { useIsMobile } from "@/hooks/use-mobile";

import HabitAISection from "../ai/HabitAISection";
import HabitCard from "./HabitCard";
import HabitForm, { type HabitFormValues } from "./HabitForm";
import { generateUniqueId } from "@/lib/generateUniqueId";
import useUser from "@/store/useUser";
import { useHabit } from "@/features/habits/utils/HabitStore";
import { getAllUserHabits } from "@/features/habits/utils/Habitaction";
import HabitQuickStats from "@/features/habits/main/HabitQuickStats";
import { stat } from "fs";

const HabitsDashboard = ({ user_id }: { user_id: number }) => {
  const {
    allHabits: habits,
    setHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheckin,
  } = useHabit();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useUser();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const a = await getAllUserHabits(user_id) as Habit[]
        setHabits(a)
      } catch (e) {
        setError("Failed to load habits.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user_id) {
      fetchHabits();
    } else {
      setIsLoading(false);
    }
  }, [user_id, setHabits]);

  const handleAddHabit = (values: HabitFormValues) => {
    const newHabit: NewHabit = {
      id: generateUniqueId(),
      user_id: user,
      name: values.name,
      description: values.description,
      emoji: values.emoji,
      createdAt: new Date(),
      checkInDays: [],
      highestStreak: 0,
    };
    addHabit(newHabit);
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDialogOpen(false);
    }
  };

  const stats = {
    totalHabits: habits.length,
    completedToday: habits.filter(
      (h) => h.checkInDays?.includes(new Date().toISOString().split("T")[0]),
    ).length,
    bestStreak: Math.max(0, ...habits.map((h) => h.highestStreak ?? 0)),
    completionRate:
      habits.length > 0
        ? Math.round(
            (habits.filter(
              (h) =>
                h.checkInDays?.includes(new Date().toISOString().split("T")[0]),
            ).length /
              habits.length) *
              100,
          )
        : 0,
  };

  const getWeeklyProgress = (habit: Habit) => {
    // Simplified logic, you might want something more sophisticated
    return (habit.checkInDays?.length ?? 0) * 10;
  };

  if (isLoading) {
    return <Loading message="Loading your habits..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-1 bg-slate-50/70 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Habit Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Stay consistent and build better habits every day.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                {stats.completedToday}/{stats.totalHabits} today
              </Badge>
              <Button
                onClick={() =>
                  isMobile ? setDrawerOpen(true) : setDialogOpen(true)
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                New Habit
              </Button>
            </div>
          </div>

        
          <HabitQuickStats  totalHabits={stats.totalHabits} 
          completedToday={stats.completedToday}
          bestStreak={stats.bestStreak}
          completionRate={stats.completionRate}
          />
          
        </header>

        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Your Habits
                  </h2>
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {habits.filter((h: Habit) => !h.checkInDays?.includes(new Date().toISOString().split('T')[0])).length} to track
                    today
                  </span>
                </div>
              </div>

              {habits.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {habits.map((habit: Habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    No habits yet!
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a new habit to start your journey.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      isMobile ? setDrawerOpen(true) : setDialogOpen(true)
                    }
                  >
                    Add Habit
                  </Button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <HabitAISection />
          </aside>
        </main>
      </div>

      {isMobile ? (
        <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>New Habit</DrawerTitle>
              <DrawerDescription>
                Add a new habit to track your progress.
              </DrawerDescription>
            </DrawerHeader>
            <HabitForm onSubmit={handleAddHabit} />
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track your progress.
              </DialogDescription>
            </DialogHeader>
            <HabitForm onSubmit={handleAddHabit} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HabitsDashboard;
