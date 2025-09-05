import NewGoalButton from "@/features/goals/components/goal/NewGoalButton";
import React from "react";
import { Sparkles } from "lucide-react"; // Perfect for AI/Smart generation
import GenerateGoalWithAIDialog from "@/features/goals/components/goal/GenerateGoalWithAIDialog";
import GenerateGoalsWithAIDialog from "@/features/goals/components/goal/GenerateGoalWithAIDialog";

const GoalHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Text Section */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
            Goals Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Track your progress and achieve your targets
          </p>
        </div>
        {/* 
        <GenerateGoalWithAIDialog /> */}
        {/* Buttons Section */}
        <div className="flex flex-wrap items-center gap-3">
          <GenerateGoalsWithAIDialog />

          {/* New Goal Button */}
          <NewGoalButton />
        </div>
      </div>
    </div>
  );
};

export default GoalHeader;
