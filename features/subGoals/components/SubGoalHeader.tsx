"use client";

import { Target } from "lucide-react";
import EditSubGoalButton from "@/features/subGoals/components/EditSubGoalButton";
import type { Subgoal } from "@/features/subGoals/subGoalschema";

interface SubgoalHeaderProps {
  subgoal:Subgoal;
}

const SubgoalHeader = ({ subgoal }: SubgoalHeaderProps) => {
  const { name, description } = subgoal;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            {name && (
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                {name}
              </h1>
            )}
            {description && (
              <p className="text-slate-500 mt-2 max-w-2xl">{description}</p>
            )}
          </div>
        </div>
        <EditSubGoalButton data={subgoal} />
      </div>
    </div>
  );
};

export default SubgoalHeader;
