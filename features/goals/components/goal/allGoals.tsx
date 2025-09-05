"use client";
import type { Goal } from "@/features/goals/goalSchema";
import { useGoal } from "@/features/goals/GoalStore";
import { useEffect } from "react";
import GoalEmptyState from "@/features/goals/components/goal/GoalEmptyState";
import GoalHeader from "@/features/goals/components/goal/GoalHeader";
import GoalQuickStats from "@/features/goals/components/goal/GoalQuickStats";
import GoalGrid from "@/features/goals/components/goal/GoalGrid";

const AllGoals = ({ goals }: { goals: Goal[] }) => {
  const { allGoals, setGoal } = useGoal();

  useEffect(() => {
    if (goals && goals.length > 0) {
      setGoal(goals);
    }
    totalGoals;
  }, [goals, setGoal]);

  const completedGoals = allGoals.filter(
    (goal) => goal.status == "Completed"
  ).length;
  const totalGoals = allGoals.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <GoalHeader />

        {/* Main Content Area */}
        {allGoals.length === 0 ? (
          //  Empty State
          <GoalEmptyState />
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <GoalQuickStats
              totalGoals={totalGoals}
              completedGoals={completedGoals}
            />

            {/* Goals Grid */}
            <GoalGrid goals={allGoals} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllGoals;
