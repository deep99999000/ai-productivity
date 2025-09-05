"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import React, { useEffect } from "react";

import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";

import SubgoalHeader from "@/features/subGoals/components/SubGoalHeader";
import SubgoalStats from "@/features/subGoals/components/SubgoalStats";
import SubgoalTasks from "@/features/subGoals/components/SubgoalTasks";

const Page = () => {
  const { id } = useParams();
  const { subgoals, updateSubgoalStatus } = useSubgoal();
  const { todos } = useTodo();

  const subgoal = subgoals.find((sg) => sg.id === Number(id));
  const tasks = subgoal ? todos.filter((t) => t.subgoal_id === subgoal.id) : [];

  // compute status
  let computedStatus: string;
  if (!subgoal || tasks.length === 0) {
    computedStatus = "Not Started";
  } else if (tasks.every((t) => t.isDone)) {
    computedStatus = "Completed";
  } else {
    computedStatus = "In Progress";
  }

  const completionPercentage = tasks.length
    ? Math.round((tasks.filter((t) => t.isDone).length / tasks.length) * 100)
    : 0;

  // update store when status changes
  useEffect(() => {
    if (subgoal && subgoal.status !== computedStatus) {
      updateSubgoalStatus(subgoal.id, computedStatus);
    }
  }, [computedStatus, subgoal, updateSubgoalStatus]);

  // loading state
  if (!subgoal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading subgoal details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href={`/goals/${subgoal.goal_id}`}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 group transition-colors"
          >
            <div className="p-2 rounded-lg group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Goal</span>
          </Link>
        </div>

        {/* Header */}
        <SubgoalHeader subgoal={subgoal} />

        {/* Stats */}
        <SubgoalStats
          subgoal={subgoal}
          computedStatus={computedStatus}
          completionPercentage={completionPercentage}
          tasks={tasks}
        />

        {/* Tasks */}
        <SubgoalTasks tasks={tasks} subgoalId={Number(id)} />
      </div>
    </div>
  );
};

export default Page;
