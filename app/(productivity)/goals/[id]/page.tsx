"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useGoal } from "@/features/goals/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { getaallsubgoal, toggleGoal } from "@/features/goals/goalaction";
import { ChevronLeft } from "lucide-react";
import type { Goal } from "@/features/goals/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import LoadingGoal from "@/features/goals/components/singlegoal/LoadingGoal";
import MilestoneSection from "@/features/goals/components/singlegoal/MileStoneSection";
import SingleGoalHeader from "@/features/goals/components/singlegoal/SingleGoalHeader";

const Page = () => {
  // Smooth fade for sections
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  const params = useParams();
  const goalId = Number(params?.id);
  const { allGoals, updateGoalStatus } = useGoal();
  const { subgoals, setSubgoals } = useSubgoal();
  const [singleGoal, setSingleGoal] = useState<Goal | null>(null);

  const goalSubgoals = subgoals
    .filter((sg): sg is Subgoal => sg.goal_id === goalId)
    .map((sg) => ({ ...sg, description: sg.description || "" }));

  const completedCount = goalSubgoals.filter(
    (sg) => sg.status === "Completed"
  ).length;

  // Load current goal + subgoals
  useEffect(() => {
    const currentGoal = allGoals.find((g) => g.id === goalId) || null;
    setSingleGoal(currentGoal);

    if (subgoals.length === 0) {
      getaallsubgoal(goalId).then(setSubgoals);
    }
  }, [allGoals, goalId, subgoals.length, setSubgoals]);

  // Update goal status based on milestones
  useEffect(() => {
    if (!singleGoal) return;

    let newStatus: Goal["status"];
    if (goalSubgoals.length === 0) newStatus = "Not Started";
    else if (completedCount === goalSubgoals.length) newStatus = "Completed";
    else newStatus = "In Progress";

    if (singleGoal.status !== newStatus) {
      updateGoalStatus(goalId, newStatus);
      toggleGoal(goalId, newStatus);
    }
  }, [goalSubgoals.length, completedCount, singleGoal, goalId, updateGoalStatus]);

  if (!singleGoal) return <LoadingGoal />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-5xl space-y-6">
        {/* Back Button */}
        <motion.div {...fadeIn}>
          <Link
            href="/goals"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 group transition-colors"
          >
            <div className="p-2 rounded-lg group-hover:bg-slate-100 mr-2 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Goals</span>
          </Link>
        </motion.div>

        {/* Goal Header */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
          <SingleGoalHeader
            goal={singleGoal}
            completedCount={completedCount}
            totalMilestones={goalSubgoals.length}
          />
        </motion.div>

        {/* Milestones */}
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
          <MilestoneSection goalId={goalId} goalSubgoals={goalSubgoals} />
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
