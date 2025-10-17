"use client";

import { useMemo } from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalyticsChartsProps {
  completedTasks: number;
  totalTasks: number;
  weeklyVelocity: number[];
  addedThisWeek: number;
  completedThisWeek: number;
}

export function AnalyticsCharts({
  completedTasks,
  totalTasks,
  weeklyVelocity,
  addedThisWeek,
  completedThisWeek,
}: AnalyticsChartsProps) {
  // Detect scope creep
  const scopeCreep = useMemo(() => {
    const ratio = addedThisWeek > 0 ? completedThisWeek / addedThisWeek : 1;
    if (ratio < 0.5 && addedThisWeek > 5) {
      return {
        detected: true,
        message: `${addedThisWeek} tasks added vs ${completedThisWeek} completed this week`,
        severity: "warning" as const,
      };
    }
    return { detected: false, message: "", severity: "normal" as const };
  }, [addedThisWeek, completedThisWeek]);

  const avgVelocity = weeklyVelocity.length > 0
    ? Math.round(weeklyVelocity.reduce((a, b) => a + b, 0) / weeklyVelocity.length)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Velocity Chart */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Weekly Velocity</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{avgVelocity}</p>
            <p className="text-xs text-slate-500">avg/week</p>
          </div>
        </div>
        
        <div className="h-32 flex items-end justify-between gap-2">
          {weeklyVelocity.map((count, i) => {
            const max = Math.max(1, ...weeklyVelocity);
            const height = (count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-lg relative overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-700">{count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Burn-up Chart */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Progress</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500">complete</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 font-medium">Completed</span>
              <span className="text-emerald-600 font-bold">{completedTasks}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 font-medium">Remaining</span>
              <span className="text-blue-600 font-bold">{totalTasks - completedTasks}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${totalTasks > 0 ? ((totalTasks - completedTasks) / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Scope Management */}
      <Card className={`p-6 rounded-2xl border ${
        scopeCreep.detected
          ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/60"
          : "bg-white/80 backdrop-blur-sm border-gray-200/80"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          {scopeCreep.detected ? (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          ) : (
            <Clock className="w-5 h-5 text-slate-600" />
          )}
          <h3 className="text-lg font-bold text-slate-900">Scope Management</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-slate-200/60">
            <p className="text-xs text-slate-500 mb-1">Added This Week</p>
            <p className="text-2xl font-bold text-blue-600">{addedThisWeek}</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-slate-200/60">
            <p className="text-xs text-slate-500 mb-1">Completed This Week</p>
            <p className="text-2xl font-bold text-emerald-600">{completedThisWeek}</p>
          </div>
        </div>

        {scopeCreep.detected && (
          <div className="mt-3 p-3 bg-white/70 rounded-xl border border-orange-200/60">
            <p className="text-xs font-semibold text-orange-700 mb-1">⚠️ Scope Creep Detected</p>
            <p className="text-xs text-slate-600">{scopeCreep.message}</p>
          </div>
        )}
      </Card>

      {/* Workload Distribution */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Workload</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <span className="text-xs font-medium text-slate-600">Total Tasks</span>
            <span className="text-sm font-bold text-slate-900">{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
            <span className="text-xs font-medium text-emerald-700">Completed</span>
            <span className="text-sm font-bold text-emerald-600">{completedTasks}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <span className="text-xs font-medium text-blue-700">In Progress</span>
            <span className="text-sm font-bold text-blue-600">{totalTasks - completedTasks}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Missing import
import { Target } from "lucide-react";
