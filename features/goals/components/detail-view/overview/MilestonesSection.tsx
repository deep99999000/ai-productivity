"use client";
import { useState } from "react";
import MilestoneAccordionItem from "./MilestoneAccordionItem";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { useTodo } from "@/features/todo/todostore";
import { Flag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GenerateSubgoalWithAIDialog from "@/features/subGoals/components/GenerateSubgoalWithAIDialog";
import NewSubGoalDialog from "@/features/subGoals/components/Newsubgoal";

interface MilestonesSectionProps {
  subgoals: Subgoal[];
  goalTodos: Todo[];
  goalId: number;
  goalName?: string; // Add goal name prop
}

const MilestonesSection = ({ subgoals, goalTodos, goalId, goalName }: MilestonesSectionProps) => {
  const { todos } = useTodo();
  const [isNewSubgoalOpen, setIsNewSubgoalOpen] = useState(false);
  
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center">
          <Flag className="text-indigo-500 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
          <span className="ml-2 text-sm text-gray-500">({subgoals.length})</span>
        </div>
        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            onClick={() => setIsNewSubgoalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Milestone
          </Button>
          <GenerateSubgoalWithAIDialog goalId={goalId} goalName={goalName} />
        </div>
      </div>
      <div className="space-y-4">
        {subgoals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No milestones yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Break down your goal into manageable milestones to track progress effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <GenerateSubgoalWithAIDialog goalId={goalId} goalName={goalName} />
              <span className="text-sm text-gray-400">or</span>
              <Button
                onClick={() => setIsNewSubgoalOpen(true)}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Manually
              </Button>
            </div>
          </div>
        ) : (
          subgoals.slice().reverse().map((sg) => (
            <MilestoneAccordionItem key={sg.id} subgoal={sg} />
          ))
        )}
      </div>

      {/* New Subgoal Dialog */}
      <NewSubGoalDialog
        isOpen={isNewSubgoalOpen}
        setIsOpen={setIsNewSubgoalOpen}
        goal_id={goalId.toString()}
      />
    </div>
  );
};

export default MilestonesSection;
