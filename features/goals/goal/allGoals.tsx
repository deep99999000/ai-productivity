"use client";
import type { Goal } from "@/features/goals/types/goalSchema";
import { useGoal } from "@/features/goals/utils/GoalStore";
import { useEffect } from "react";
import GoalEmptyState from "@/features/goals/goal/GoalEmptyState";
import GoalHeader from "@/features/goals/goal/GoalHeader";
import GoalQuickStats from "@/features/goals/goal/GoalQuickStats";
import GoalGrid from "@/features/goals/goal/GoalGrid";

const AllGoals = ({ goals }: { goals: Goal[] }) => {
  const { allGoals, setGoal } = useGoal();

  useEffect(() => {
    if (goals && goals.length > 0) {
      setGoal(goals);
    }
  }, [goals, setGoal]);

  const completedGoals = allGoals.filter(
    (goal) => goal.status == "Completed"
  ).length;
  const totalGoals = allGoals.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <GoalHeader />

      {/* Main Content Area */}
      {allGoals.length === 0 ? (
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
  );
};

export default AllGoals;
