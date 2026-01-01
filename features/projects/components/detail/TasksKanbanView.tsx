"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/features/projects/store";
import TaskCard from "./TaskCard";

interface TasksKanbanViewProps {
  projectId: number;
  userId: string;
}

const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-zinc-100", dot: "bg-zinc-400" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-50", dot: "bg-blue-500" },
  { id: "in_review", label: "In Review", color: "bg-violet-50", dot: "bg-violet-500" },
  { id: "completed", label: "Completed", color: "bg-emerald-50", dot: "bg-emerald-500" },
  { id: "blocked", label: "Blocked", color: "bg-rose-50", dot: "bg-rose-500" },
];

export default function TasksKanbanView({ projectId, userId }: TasksKanbanViewProps) {
  const { tasks, milestones } = useProject();

  // Get all tasks for this project
  const projectMilestones = milestones.filter(m => m.project_id === projectId);
  const projectTasks = tasks.filter(t => 
    projectMilestones.some(m => m.id === t.milestone_id)
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, typeof projectTasks> = {};
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = projectTasks.filter(t => t.status === col.id);
    });
    return grouped;
  }, [projectTasks]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = tasksByStatus[column.id] || [];
        
        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-white rounded-2xl border border-zinc-200/80 h-full">
              <div className={`px-4 py-3 ${column.color} rounded-t-2xl border-b border-zinc-100`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${column.dot}`} />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {column.label}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-white/80 text-zinc-600">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} userId={userId} projectId={projectId} />
                    ))
                  ) : (
                    <div className="p-4 text-center bg-zinc-50 rounded-xl">
                      <p className="text-xs text-zinc-400">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
