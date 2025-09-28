"use client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { cn } from "@/lib/utils";

const subgoalStatusValue = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("completed")) return 1;
  if (s.includes("progress")) return 0.5;
  return 0;
};

const formatDate = (date?: string | Date | null) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

interface TimelineProps {
  subgoals: Subgoal[];
  todos: Todo[];
  max?: number;
}

const Timeline = ({ subgoals, todos, max = 5 }: TimelineProps) => {
  if (subgoals.length === 0) return <p className="text-sm text-gray-500">No milestones to display.</p>;
  return (
    <div className="relative pt-10 pb-4">
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200" />
      <div className="flex justify-between items-start text-center">
        {subgoals.slice(0, max).map((sg) => {
          const sgTodos = todos.filter((t) => t.subgoal_id === sg.id);
            const done = sgTodos.filter((t) => t.isDone).length;
            const total = sgTodos.length;
            const percent = total > 0 ? done / total : subgoalStatusValue(sg.status);
            const state = percent >= 1 ? "done" : percent > 0 ? "progress" : "pending";
            const color = state === "done" ? "teal" : state === "progress" ? "blue" : "gray";
          return (
            <div key={sg.id} className="relative w-full">
              <div className={cn("w-8 h-8 rounded-full mx-auto flex items-center justify-center ring-4", color === "teal" && "bg-teal-500 ring-teal-100", color === "blue" && "bg-blue-500 ring-blue-100 animate-pulse", color === "gray" && "bg-gray-300 ring-gray-100")}>{state === "done" ? <CheckCircle2 className="w-5 h-5 text-white" /> : state === "progress" ? <AlertTriangle className="w-5 h-5 text-white" /> : null}</div>
              <p className={cn("text-sm font-semibold mt-2", state === "progress" && "text-red-600")}>{sg.name.length > 16 ? sg.name.slice(0, 16) + "…" : sg.name}</p>
              <p className="text-xs text-gray-500">{formatDate(sg.endDate as any)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
