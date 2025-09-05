import { Target } from "lucide-react";
import type { Goal } from "@/features/goals/goalSchema";
import EditGoalButton from "@/features/goals/components/goal/EditGoalButton";
import SingleGoalStats from "@/features/goals/components/singlegoal/SingleGoalStat";

interface GoalHeaderProps {
  goal: Goal;
  completedCount: number;
  totalMilestones: number;
}

const SingleGoalHeader = ({ goal, completedCount, totalMilestones }: GoalHeaderProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-5 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                {goal.name}
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                {goal.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>
        {/* Edit Button */}
        <EditGoalButton data={goal} />
      </div>

      {/* Stats */}
      <SingleGoalStats
        endDate={goal.endDate || "not set"}
        status={goal.status}
        completedCount={completedCount}
        totalMilestones={totalMilestones}
      />
    </div>
  );
};

export default SingleGoalHeader;
