"use client";
import MilestoneAccordionItem from "./MilestoneAccordionItem";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { useTodo } from "@/features/todo/todostore";
import { Flag } from "lucide-react";
import GenerateSubgoalWithAIDialog from "@/features/subGoals/components/GenerateSubgoalWithAIDialog";

interface MilestonesSectionProps {
  subgoals: Subgoal[];
  goalTodos: Todo[];
  goalId: number; // added
}

const MilestonesSection = ({ subgoals, goalTodos, goalId }: MilestonesSectionProps) => {
  const { todos } = useTodo();
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center">
          <Flag className="text-indigo-500 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
          <span className="ml-2 text-sm text-gray-500">({subgoals.length})</span>
        </div>
        {/* AI Subgoal Generator trigger */}
        <div className="flex items-center flex-wrap gap-2">
          <GenerateSubgoalWithAIDialog goalId={goalId} />
        </div>
      </div>
      <div className="space-y-4">
        {subgoals.length === 0 && <p className="text-sm text-gray-500">No milestones yet.</p>}
        {subgoals.slice().reverse().map((sg) => (
          <MilestoneAccordionItem key={sg.id} subgoal={sg} />
        ))}
      </div>
    </div>
  );
};

export default MilestonesSection;
