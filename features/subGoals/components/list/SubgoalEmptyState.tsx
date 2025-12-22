"use client";

import { Button } from "@/components/ui/button";
import { Plus, ListChecks } from "lucide-react";
import NewTaskButton from "@/features/todo/components/form/NewTodoButton";

interface SubgoalEmptyStateProps {
  subgoalId: number;
}

const SubgoalEmptyState = ({ subgoalId }: SubgoalEmptyStateProps) => {
  return (
    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ListChecks className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-800 mb-1">No tasks yet</h3>
      <p className="text-slate-500 mb-4 max-w-md mx-auto">
        Add your first task to start making progress on this milestone.
      </p>
      <NewTaskButton subgoal_id={subgoalId}>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Button>
      </NewTaskButton>
    </div>
  );
};

export default SubgoalEmptyState;
