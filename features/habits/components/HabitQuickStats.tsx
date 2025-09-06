"use client";

import { StatCard } from "@/components/StateCard";
import { Target, TrendingUp, Flame, CheckCircle2 } from "lucide-react";

interface HabitQuickStatsProps {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
  completionRate: number;
}

export default function HabitQuickStats({
  totalHabits,
  completedToday,
  bestStreak,
  completionRate,
}: HabitQuickStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Habits"
        value={totalHabits}
        icon={<Target className="w-6 h-6" />}
        iconBgColor="bg-blue-100"
        Color="text-blue-600"
      />
      <StatCard
        title="Completed Today"
        value={completedToday}
        icon={<CheckCircle2 className="w-6 h-6" />}
        iconBgColor="bg-emerald-100"
        Color="text-emerald-600"
      />
      <StatCard
        title="Best Streak"
        value={`${bestStreak}d`}
        icon={<Flame className="w-6 h-6" />}
        iconBgColor="bg-orange-100"
        Color="text-orange-600"
      />
      <StatCard
        title="Completion Rate"
        value={`${completionRate}%`}
        icon={<TrendingUp className="w-6 h-6" />}
        iconBgColor="bg-purple-100"
        Color="text-purple-600"
      />
    </div>
  );
}
