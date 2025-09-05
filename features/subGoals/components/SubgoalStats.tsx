"use client";

import { Calendar, ListChecks, TrendingUp } from "lucide-react";
import { ShowDate } from "@/components/ShowDate";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

interface SubgoalStatsProps {
  subgoal:Subgoal
  computedStatus: string;
  completionPercentage: number;
  tasks: Todo[];
}

const SubgoalStats = ({
  subgoal,
  computedStatus,
  completionPercentage,
  tasks,
}: SubgoalStatsProps) => {
  const { endDate, status, isdone } = subgoal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Status Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isdone
                ? "bg-green-100"
                : status === "In Progress"
                ? "bg-yellow-100"
                : "bg-purple-100"
            }`}
          >
            <TrendingUp
              className={`w-5 h-5 ${
                isdone
                  ? "text-green-600"
                  : status === "In Progress"
                  ? "text-yellow-600"
                  : "text-purple-600"
              }`}
            />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Status</p>
            <p className="text-base font-semibold text-slate-900">
              {computedStatus}
            </p>
          </div>
        </div>
      </div>

      {/* End Date Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">End Date</p>
            <p className="text-base font-semibold text-slate-900">
              {endDate ? <ShowDate date={endDate} /> : "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <ListChecks className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-slate-500 text-sm">Progress</p>
              <span className="text-sm font-medium text-slate-700">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {tasks.filter((t) => t.isDone).length} of {tasks.length} tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubgoalStats;
