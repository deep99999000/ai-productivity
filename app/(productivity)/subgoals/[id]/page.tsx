"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import React, { useEffect } from "react";
import { motion } from "motion/react";

import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";

import SubgoalHeader from "@/features/subGoals/components/SubGoalHeader";
import SubgoalStats from "@/features/subGoals/components/SubgoalStats";
import SubgoalTasks from "@/features/subGoals/components/SubgoalTasks";

const Page = () => {
  // Smooth fade for sections
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-5xl space-y-6">
        {/* Back button */}
        <motion.div {...fadeIn}>
          <Link
            href={`/goals/${subgoal.goal_id}`}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 group transition-colors"
          >
            <div className="p-2 rounded-lg group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Goal</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
          <SubgoalHeader subgoal={subgoal} />
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
          <SubgoalStats
            subgoal={subgoal}
            computedStatus={computedStatus}
            completionPercentage={completionPercentage}
            tasks={tasks}
          />
        </motion.div>

        {/* Tasks */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
          <SubgoalTasks tasks={tasks} subgoalId={Number(id)} />
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
