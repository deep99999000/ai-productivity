import NewGoalButton from "@/features/goals/components/goal/NewGoalButton";
import React, { useState } from "react";
import { Sparkles, BookOpen, TrendingUp, Brain, Zap, GitBranch, BarChart, Target } from "lucide-react";
import GenerateGoalWithAIDialog from "@/features/goals/components/goal/GenerateGoalWithAIDialog";
import GenerateGoalsWithAIDialog from "@/features/goals/components/goal/GenerateGoalWithAIDialog";
import GoalTemplateLibrary from "@/features/goals/components/goal/GoalTemplateLibrary";
import AdvancedAnalyticsDashboard from "@/features/goals/components/detail-view/analytics/AdvancedAnalyticsDashboard";
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { useGoal } from "@/features/goals/store/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";

const GoalHeader = () => {
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  // Get data for analytics
  const { allGoals } = useGoal();
  const { subgoals } = useSubgoal();
  const { todos } = useTodo();

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Text Section */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
            Goals Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Track your progress and achieve your targets with AI-powered insights
          </p>
        </div>
        
        {/* Enhanced Buttons Section */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Advanced Analytics Button */}
          <Button
            onClick={() => setIsAnalyticsOpen(true)}
            variant="outline"
            className="px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 border-blue-200 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200"
          >
            <BarChart className="w-5 h-5 mr-2 text-blue-600 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="whitespace-nowrap font-semibold text-blue-700">Analytics</span>
          </Button>

          {/* Template Library Button */}
          <Button
            onClick={() => setIsTemplateLibraryOpen(true)}
            variant="outline"
            className="px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group border-2 border-purple-200 hover:border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200"
          >
            <BookOpen className="w-5 h-5 mr-2 text-purple-600 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="whitespace-nowrap font-semibold text-purple-700">Templates</span>
          </Button>

          {/* AI Goal Generation */}
          <GenerateGoalsWithAIDialog />

          {/* New Goal Button */}
          <NewGoalButton />
        </div>
      </div>

      {/* Enhanced Template Library Dialog */}
      <GoalTemplateLibrary 
        isOpen={isTemplateLibraryOpen} 
        setIsOpen={setIsTemplateLibraryOpen} 
      />

      {/* Advanced Analytics Dashboard Dialog */}
      <BaseDialog
        isOpen={isAnalyticsOpen}
        setisOpen={setIsAnalyticsOpen}
        title=""
        description=""
      >
        <div className="max-w-7xl mx-auto">
          <AdvancedAnalyticsDashboard 
            goals={allGoals}
            subgoals={subgoals}
            todos={todos}
          />
        </div>
      </BaseDialog>
    </div>
  );
};

export default GoalHeader;
