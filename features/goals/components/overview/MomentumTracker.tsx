"use client";

import { Flame, TrendingUp, Calendar, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MomentumTrackerProps {
  streak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  daysActive: number;
  recentWins: string[];
}

export function MomentumTracker({
  streak,
  tasksCompletedToday,
  tasksCompletedThisWeek,
  daysActive,
  recentWins,
}: MomentumTrackerProps) {
  return (
    <Card className="bg-white border-black-200/60 p-6 rounded-2xl">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold text-slate-900">Momentum</h3>
          <p className="text-xs text-slate-500">Keep the fire burning</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-orange-200/40">
          <div className="flex items-center justify-between mb-1">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">{streak}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Day Streak</p>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-emerald-200/40">
          <div className="flex items-center justify-between mb-1">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">{tasksCompletedToday}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Done Today</p>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-blue-200/40">
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{tasksCompletedThisWeek}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">This Week</p>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-purple-200/40">
          <div className="flex items-center justify-between mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{daysActive}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Days Active</p>
        </div>
      </div>

      {/* Recent Wins */}
      {recentWins.length > 0 && (
        <div className="pt-3 border-t border-orange-200/60">
          <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
            Recent Wins
          </p>
          <div className="space-y-1.5">
            {recentWins.slice(0, 3).map((win, i) => (
              <div
                key={i}
                className="text-xs text-slate-600 flex items-start gap-2 bg-white/50 rounded-lg p-2"
              >
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span className="line-clamp-1">{win}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
