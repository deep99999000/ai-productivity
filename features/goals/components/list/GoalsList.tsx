"use client";
import type { Goal } from "@/features/goals/schema";
import { useGoal } from "@/features/goals/store";
import { useEffect } from "react";
import GoalEmptyState from "@/features/goals/components/list/GoalEmptyState";
import GoalHeader from "@/features/goals/components/list/GoalHeader";
import GoalQuickStats from "@/features/goals/components/list/GoalQuickStats";
import GoalGrid from "@/features/goals/components/list/GoalGrid";

const GoalsList = ({ goals }: { goals: Goal[] }) => {
  const { allGoals, setGoal } = useGoal();

  // Sync server goals to store
  useEffect(() => {
    if (goals && goals.length > 0) {
      setGoal(goals);
    }
  }, [goals, setGoal]);

  // Calculate stats
  const completedGoals = allGoals.filter(
    (goal) => goal.status == "Completed"
  ).length;
  const totalGoals = allGoals.length;

  return (
    <div className="space-y-6">
      {/* 📋 Header */}
      <GoalHeader />

      {/* 🎯 Goals Content */}
      {allGoals.length === 0 ? (
        <GoalEmptyState />
      ) : (
        <div className="space-y-6">
          <GoalQuickStats
            totalGoals={totalGoals}
            completedGoals={completedGoals}
          />
          <GoalGrid goals={allGoals} />
        </div>
      )}
    </div>
  );
};

export default GoalsList;
