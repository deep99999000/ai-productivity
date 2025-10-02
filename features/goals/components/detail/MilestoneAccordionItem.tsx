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

  const { todos: t, toggleTodo, deleteTodo } = useTodo();
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
    deleteSubgoal(subgoal.id);
    await DeleteSubGoalsAction(subgoal.id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full justify-between items-center p-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-lg"
        aria-expanded={open}
        aria-controls={`subgoal-content-${subgoal.id}`}
      >
        <div className="flex items-center min-w-0">
          <span
            className={cn(
              "mr-3 flex-shrink-0",
              percent === 100
                ? "text-teal-500"
                : percent > 0
                ? "text-blue-500"
                : "text-gray-400"
            )}
          >
            {percent === 100 ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : percent > 0 ? (
              <Milestone className="w-5 h-5" />
            ) : (
              <Flag className="w-5 h-5" />
            )}
          </span>
          <h3 className="font-semibold text-gray-800 truncate pr-2">
            {subgoal.name}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
          >
            {badge.label}
          </span>
          <span
            className={cn(
              "text-sm font-medium min-w-[36px] text-right",
              percent === 100
                ? "text-teal-600"
                : percent > 0
                ? "text-blue-600"
                : "text-gray-500"
            )}
          >
            {percent}%
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      {open && (
        <div
          id={`subgoal-content-${subgoal.id}`}
          className="px-4 pb-4 animate-in fade-in slide-in-from-top-2"
        >
          <ProgressBar value={percent} className="mt-2" />

          {subgoal.description && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
              {subgoal.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span className="font-medium">
              {completed} / {total} tasks
            </span>
            <div className="flex flex-wrap gap-2">
              <GenerateTasksWithAIDialog
                subgoalId={subgoal.id}
                subgoalName={subgoal.name}
              />
              {/* New Task */}
              <button
                onClick={() => setIsnew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>

              {/* Edit Subgoal */}
              <button
                onClick={() => setIsedit(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>

              {/* Delete Subgoal */}
              <button
                onClick={deletesubgoalfunc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Todo List */}
          <div className="mt-4 space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 italic">No tasks yet.</p>
              </div>
            ) : (
              todos.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors relative"
                >
                  {t.isDone ? (
                    <CheckCircle2
                      className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0 cursor-pointer"
                      onClick={() => handleToggle(t.id, true)}
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0 cursor-pointer"
                      onClick={() => handleToggle(t.id, false)}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium text-gray-800",
                        t.isDone && "line-through text-gray-500"
                      )}
                    >
                      {t.name}
                    </p>
                    {t.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingTodo(t)}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        deleteTodo(t.id);
                        await deleteTodoFromdb(t.id);
                      }}
                      className="p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
