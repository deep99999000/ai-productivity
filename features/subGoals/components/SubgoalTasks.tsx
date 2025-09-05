"use client";

import { Button } from "@/components/ui/button";
import { Plus, PlusCircle, ListChecks } from "lucide-react";
import GenerateTasksWithAIDialog from "@/features/todo/components/GenerateTasksWithAIDialog";
import NewTaskButton from "@/features/todo/components/NewTodoButton";
import SubgoalTaskList from "./SubgoalTaskList";
import SubgoalEmptyState from "@/features/subGoals/components/SubgoalEmptyState";
import type { Todo } from "@/features/todo/todoSchema";

interface SubgoalTasksProps {
  tasks: Todo[];
  subgoalId: number;
}

const SubgoalTasks = ({ tasks, subgoalId }: SubgoalTasksProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
          <span className="text-slate-500 text-sm bg-slate-100 px-2 py-1 rounded-md">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GenerateTasksWithAIDialog
            subgoalId={subgoalId}
            subgoalName="Subgoal"
          />
          <NewTaskButton subgoal_id={subgoalId}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-xl transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Todo
            </Button>
          </NewTaskButton>
        </div>
      </div>

      {/* Task list or empty state */}
      {tasks.length > 0 ? (
        <SubgoalTaskList tasks={tasks} />
      ) : (
        <SubgoalEmptyState subgoalId={subgoalId} />
      )}
    </div>
  );
};

export default SubgoalTasks;
