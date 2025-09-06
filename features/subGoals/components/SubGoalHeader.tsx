"use client";

import { Target } from "lucide-react";
import EditSubGoalButton from "@/features/subGoals/components/EditSubGoalButton";
import type { Subgoal } from "@/features/subGoals/subGoalschema";

interface SubgoalHeaderProps {
  subgoal: Subgoal;
}

const SubgoalHeader = ({ subgoal }: SubgoalHeaderProps) => {
  const { name, description } = subgoal;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            {name && (
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                {name}
              </h1>
            )}
            {description && (
              <p className="text-slate-600 text-lg mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        <EditSubGoalButton data={subgoal} />
      </div>
    </div>
  );
};

export default SubgoalHeader;
