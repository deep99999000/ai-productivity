"use client";

import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  Flame,
  Smile,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Habit } from "@/features/habits/schema";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useHabit } from "@/features/habits/store";
import { deletehabitaction, updatewhabitaction } from "@/features/habits/actions";
import HabitForm, { type HabitFormValues } from "../form/HabitForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HabitDetailsProps {
  habit: Habit | null;
}

export default function HabitDetails({ habit }: HabitDetailsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteHabit, updateHabit } = useHabit();

  const handleEdit = async (values: HabitFormValues) => {
    if (!habit?.id) return;
    const updatedHabit = {
      ...habit,
      name: values.name,
      description: values.description || null,
      emoji: values.emoji || null,
    };
    updateHabit(updatedHabit);
    updatewhabitaction(updatedHabit).catch(console.error);
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!habit?.id) return;
    deleteHabit(habit.id as number);
    deletehabitaction(habit.id as number).catch(console.error);
    setDeleteDialogOpen(false);
  };

  if (!habit) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 p-4">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Select a habit to view details</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyCheckIns = useMemo(() => {
    if (!habit.checkInDays) return 0;
    return habit.checkInDays.filter((day) => {
      const date = new Date(day);
      return isSameMonth(date, currentMonth);
    }).length;
  }, [habit.checkInDays, currentMonth]);

  const totalCheckIns = habit.checkInDays?.length ?? 0;

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
  const daysPassedInMonth = isSameMonth(currentMonth, today)
    ? Math.min(eachDayOfInterval({ start: monthStart, end: today }).length, daysInMonth)
    : daysInMonth;
  const monthlyRate = daysPassedInMonth > 0 
    ? Math.round((monthlyCheckIns / daysPassedInMonth) * 100) 
    : 0;

  const currentStreak = useMemo(() => {
    if (!habit.checkInDays || habit.checkInDays.length === 0) return 0;
    const sortedDays = [...habit.checkInDays].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (sortedDays.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [habit.checkInDays]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getIconBgColor = (str: string) => {
    const colors = [
      { bg: "bg-amber-50", icon: "bg-amber-100" },
      { bg: "bg-blue-50", icon: "bg-blue-100" },
      { bg: "bg-emerald-50", icon: "bg-emerald-100" },
      { bg: "bg-violet-50", icon: "bg-violet-100" },
      { bg: "bg-rose-50", icon: "bg-rose-100" },
      { bg: "bg-cyan-50", icon: "bg-cyan-100" },
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClasses = getIconBgColor(habit.name);

  return (
    <div className="px-4 h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl text-xl",
              colorClasses.icon
            )}
          >
            {habit.emoji || "📝"}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{habit.name}</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Habit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Habit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Habit</DialogTitle>
              <DialogDescription>
                Update your habit details
              </DialogDescription>
            </DialogHeader>
            <HabitForm
              defaultValues={{
                name: habit?.name || "",
                description: habit?.description || "",
                emoji: habit?.emoji || "✅",
                frequency: "daily",
              }}
              submitLabel="Save Changes"
              onSubmit={handleEdit}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Habit</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{habit?.name}"? This action cannot be undone and all check-in data will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="p-3 rounded-xl bg-white border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 truncate">
              Monthly check-ins
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800">
              {monthlyCheckIns}
            </span>
            <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 truncate">
              Total Check-Ins
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800">
              {totalCheckIns}
            </span>
            <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 truncate">
              Monthly check-in rate
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800">
              {monthlyRate}
            </span>
            <span className="text-xs font-medium text-slate-400">%</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 truncate">
              Current Streak
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800">
              {currentStreak}
            </span>
            <span className="text-xs font-medium text-slate-400">Day</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-slate-700">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isCheckedIn = habit.checkInDays?.includes(dateStr);
            const dayNum = format(day, "d");
            const isFriday = getDay(day) === 5;

            return (
              <div
                key={idx}
                className="aspect-square flex items-center justify-center"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    !isCurrentMonth && "text-slate-200",
                    isCurrentMonth && !isCheckedIn && !isToday && "text-slate-500",
                    isCurrentMonth && isFriday && !isCheckedIn && "text-blue-500",
                    isCheckedIn && isCurrentMonth && "bg-slate-100",
                    isToday && !isCheckedIn && "bg-slate-50 ring-1 ring-blue-300"
                  )}
                >
                  {isCheckedIn && isCurrentMonth ? (
                    <span className="text-base">{habit.emoji || "✅"}</span>
                  ) : (
                    dayNum
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Log */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-600 mb-1.5">
          Habit Log on {format(currentMonth, "MMMM")}
        </h3>
        <p className="text-xs text-slate-400">
          No check-in thoughts to share this month yet
        </p>
      </div>
    </div>
  );
}
