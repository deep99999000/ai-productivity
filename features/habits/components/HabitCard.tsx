"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Flame, Clock4, CheckCircle2, RotateCcw, Edit, Trash2 } from "lucide-react";
import { useHabit } from "@/features/habits/HabitStore";
import HabitForm from "./HabitForm";
import type { Habit } from "@/features/habits/habitSchema";

function todayISO() { return new Date().toISOString().slice(0,10); }

function computeStreak(map: Record<string, boolean>): number {
  if (!map) return 0;
  const today = new Date();
  let s = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (map[iso]) s++; else break;
  }
  return s;
}

function last30Progress(map: Record<string, boolean>): number {
  if (!map) return 0;
  const today = new Date();
  let count = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (map[iso]) count++;
  }
  return Math.round((count / 30) * 100);
}

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HabitCard({ habit }: { habit: Habit }) {
  const { toggleCheckin, deleteHabit, checkins } = useHabit();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const map = checkins[String(habit.id)] ?? {};
  const doneToday = !!map[todayISO()];
  const streak = useMemo(() => computeStreak(map), [map]);
  const progress30 = useMemo(() => last30Progress(map), [map]);

  const plannedDays: number[] = useMemo(() => {
    const freq = (habit as any).frequency ?? "daily";
    if (freq === "daily") return [0,1,2,3,4,5,6];
    if (freq === "weekly" || freq === "custom") return ((habit as any).days ?? [1,2,3,4,5]) as number[];
    return [1,2,3,4,5];
  }, [habit]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group border-slate-200/80 hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="text-4xl leading-none select-none mt-1">{habit.emoji ?? "✅"}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg break-words leading-tight">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-sm text-slate-600 mt-2 break-words leading-relaxed">
                    {habit.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500"/>
                    <span className="font-medium">{streak}</span>
                    <span>day streak</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock4 className="h-4 w-4 text-sky-500"/>
                    <span className="font-medium">{progress30}%</span>
                    <span>30d progress</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <HabitForm
                defaultValues={{
                  id: habit.id as number,
                  name: habit.name,
                  description: habit.description ?? undefined,
                  emoji: habit.emoji ?? "✅",
                  frequency: (habit as any).frequency ?? "daily",
                  days: (habit as any).days ?? undefined,
                }}
                trigger={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />

              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete habit?</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-600">This will remove the habit and its local check-ins.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { deleteHabit(habit.id as number); setConfirmOpen(false); }}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">30-Day Progress</span>
              <span className="text-xs font-semibold text-slate-900">{progress30}%</span>
            </div>
            <Progress value={progress30} className="h-2" />
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium mb-2 text-slate-600">This Week</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {WEEK_LETTERS.map((l, idx) => {
                const active = plannedDays.includes(idx);
                return (
                  <span
                    key={idx}
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-medium border transition ${
                      active 
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" 
                        : "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                    title={active ? "Planned" : "Not planned"}
                  >
                    {l}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            {doneToday ? (
              <Button 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5" 
                onClick={() => toggleCheckin(habit.id)}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> 
                Uncheck Today
              </Button>
            ) : (
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5" 
                onClick={() => toggleCheckin(habit.id)}
              >
                Check In Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
