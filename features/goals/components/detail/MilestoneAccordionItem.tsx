"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Flag,
  Milestone,
  CheckCircle2,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import ProgressBar from "./ProgressBar";
import { useTodo } from "@/features/todo/todostore";
import {
  deleteTodoFromdb,
  updateTodosStatus,
} from "@/features/todo/todoaction";
import useUser from "@/store/useUser";
import NewTodoDialog from "@/features/todo/components/NewTodo";
import EditSubgoalDialog from "@/features/subGoals/components/EditSubgoalDialog";
import EditTodoDialog from "@/features/todo/components/EditTodoDialog";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { DeleteSubGoalsAction } from "@/features/goals/goalaction";
import GenerateTasksWithAIDialog from "@/features/todo/components/GenerateTasksWithAIDialog";

interface MilestoneAccordionItemProps {
  subgoal: Subgoal;
  onAddTask?: (subgoalId: number) => void;
  onEdit?: (subgoal: Subgoal) => void;
  onDelete?: (subgoalId: number) => void; // delete logic
}

const MilestoneAccordionItem = ({
  subgoal,
  onDelete,
}: MilestoneAccordionItemProps) => {
  const [open, setOpen] = useState(false);
  const [isnew, setIsnew] = useState(false);
  const [isedit, setIsedit] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { todos: t, toggleTodo, deleteTodo, deleteTodosBySubgoal } = useTodo();
  const todos = t.filter((todo) => todo.subgoal_id === subgoal.id);
  const { deleteSubgoal, updateSubgoalStatus } = useSubgoal();

  const completed = todos.filter((t) => t.isDone).length;
  const total = todos.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const statusBadge = () => {
    if (percent === 100)
      return { label: "Done", className: "bg-teal-100 text-teal-700" };
    if (percent != 0 || todos.length != 0)
      return {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-800",
      };
    return { label: "Not Started", className: "bg-red-100 text-red-700" };
  };

  const { user } = useUser();
  const badge = statusBadge();
  useEffect(() => {
    if (percent === 100) {
      updateSubgoalStatus(subgoal.id, "completed");
    } else if (percent != 0 || todos.length != 0) {
      updateSubgoalStatus(subgoal.id, "in_progress");
    } else {
      updateSubgoalStatus(subgoal.id, "not_started");
    }
    console.log(subgoal.status);
  }, [percent]);

  const handleToggle = async (id: number, isDone: boolean) => {
    toggleTodo(id);
    await updateTodosStatus(user, id, !isDone);
  };

  const deletesubgoalfunc = async () => {
    try {
      // 1. Delete from local state first (optimistic update)
      deleteTodosBySubgoal(subgoal.id);
      deleteSubgoal(subgoal.id);
      
      // 2. Delete from database (cascade deletion)
      const result = await DeleteSubGoalsAction(subgoal.id);
      
      if (result) {
        console.log(`Successfully deleted milestone "${subgoal.name}" and ${result.todoCount} associated tasks`);
      }
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      // TODO: Add proper error handling/toast notification
      // For now, we could revert the optimistic update if needed
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.01] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full justify-between items-center p-5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-xl hover:bg-gray-50/50 transition-all duration-200"
        aria-expanded={open}
        aria-controls={`subgoal-content-${subgoal.id}`}
      >
        <div className="flex items-center min-w-0">
          <div className={cn(
            "mr-3 flex-shrink-0 p-2 rounded-full transition-all duration-300",
            percent === 100
              ? "text-teal-500 bg-teal-50 shadow-sm"
              : percent > 0
              ? "text-blue-500 bg-blue-50 shadow-sm"
              : "text-gray-400 bg-gray-50"
          )}>
            {percent === 100 ? (
              <CheckCircle2 className="w-5 h-5 animate-pulse" />
            ) : percent > 0 ? (
              <Milestone className="w-5 h-5" />
            ) : (
              <Flag className="w-5 h-5" />
            )}
          </div>
          <h3 className="font-semibold text-gray-800 truncate pr-2 text-lg">
            {subgoal.name}
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${badge.className} shadow-sm`}
          >
            {badge.label}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold min-w-[36px] text-right transition-colors duration-300",
                percent === 100
                  ? "text-teal-600"
                  : percent > 0
                  ? "text-blue-600"
                  : "text-gray-500"
              )}
            >
              {percent}%
            </span>
            <div className={cn(
              "w-12 h-2 bg-gray-200 rounded-full overflow-hidden transition-all duration-300",
              percent > 0 && "shadow-inner"
            )}>
              <div
                className={cn(
                  "h-full transition-all duration-700 ease-out rounded-full",
                  percent === 100
                    ? "bg-gradient-to-r from-teal-400 to-teal-500"
                    : percent > 0
                    ? "bg-gradient-to-r from-blue-400 to-blue-500"
                    : "bg-gray-300"
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-gray-400 transition-all duration-300 ease-out",
              open && "rotate-180 text-blue-500"
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      {open && (
        <div
          id={`subgoal-content-${subgoal.id}`}
          className="px-5 pb-5 animate-in fade-in slide-in-from-top-4 duration-300 border-t border-gray-100"
        >
          <ProgressBar value={percent} className="mt-4" />

          {subgoal.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-200 transition-all duration-300 hover:bg-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {subgoal.description}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 text-sm">
              {completed} / {total} tasks completed
            </span>
            <div className="flex flex-wrap gap-2">
              <GenerateTasksWithAIDialog
                subgoalId={subgoal.id}
                subgoalName={subgoal.name}
                goalId={subgoal.goal_id}
              />
              {/* New Task */}
              <button
                onClick={() => setIsnew(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>

              {/* Edit Subgoal */}
              <button
                onClick={() => setIsedit(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>

              {/* Delete Subgoal */}
              <button
                onClick={deletesubgoalfunc}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="mt-5 space-y-3">
            {todos.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No tasks yet</p>
                  <p className="text-xs text-gray-400">Add your first task to get started</p>
                </div>
              </div>
            ) : (
              todos.map((t, index) => (
                <div
                  key={t.id}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-300 relative transform hover:scale-[1.02] hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    {t.isDone ? (
                      <CheckCircle2
                        className="w-6 h-6 text-teal-500 mt-0.5 flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-110 drop-shadow-sm"
                        onClick={() => handleToggle(t.id, true)}
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:scale-110 bg-white shadow-sm"
                        onClick={() => handleToggle(t.id, false)}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold text-gray-800 transition-all duration-300",
                        t.isDone && "line-through text-gray-500"
                      )}
                    >
                      {t.name}
                    </p>
                    {t.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => setEditingTodo(t)}
                      className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        deleteTodo(t.id);
                        await deleteTodoFromdb(t.id);
                      }}
                      className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NewTodoDialog
        isOpen={isnew}
        setIsOpen={setIsnew}
        defaultSubgoalId={subgoal.id}
        defaultgoalId={subgoal.goal_id}
      />
      <EditSubgoalDialog
        open={isedit}
        setisOpen={setIsedit}
        initialData={subgoal}
      />
      {editingTodo && (
        <EditTodoDialog
          open={!!editingTodo}
          setisOpen={(open) => {
            if (!open) setEditingTodo(null);
          }}
          initialData={editingTodo}
        />
      )}
    </div>
  );
};

export default MilestoneAccordionItem;
