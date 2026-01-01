"use client";

import { useState } from "react";
import { Plus, ListTodo, CheckCircle2, Clock, AlertTriangle, Ban, LayoutGrid, List, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/features/projects/store";
import CreateTaskDialog from "./CreateTaskDialog";
import TaskCard from "./TaskCard";
import TasksKanbanView from "./TasksKanbanView";
import { motion } from "framer-motion";

interface TasksSectionProps {
  projectId: number;
  userId: string;
}

export default function TasksSection({ projectId, userId }: TasksSectionProps) {
  const { tasks, milestones } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Get all tasks for this project
  const projectMilestones = milestones.filter(m => m.project_id === projectId);
  const projectTasks = tasks.filter(t => 
    projectMilestones.some(m => m.id === t.milestone_id)
  );

  // Calculate statistics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === "completed").length;
  const inProgressTasks = projectTasks.filter(t => t.status === "in_progress").length;
  const blockedTasks = projectTasks.filter(t => t.is_blocked).length;
  const todoTasks = projectTasks.filter(t => t.status === "todo").length;

  const stats = [
    { label: "Total", value: totalTasks, icon: ListTodo, color: "bg-zinc-900", textColor: "text-white" },
    { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "bg-emerald-600", textColor: "text-white" },
    { label: "In Progress", value: inProgressTasks, icon: Clock, color: "bg-blue-600", textColor: "text-white" },
    { label: "To Do", value: todoTasks, icon: AlertTriangle, color: "bg-zinc-400", textColor: "text-white" },
    { label: "Blocked", value: blockedTasks, icon: Ban, color: "bg-rose-600", textColor: "text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Tasks</h2>
          <p className="text-zinc-500 mt-1">
            All tasks across project milestones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white border border-zinc-200 rounded-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-9 px-3 rounded-lg transition-all duration-200 ${
                viewMode === "list" 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <List className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">List</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={`h-9 px-3 rounded-lg transition-all duration-200 ${
                viewMode === "kanban" 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Kanban</span>
            </Button>
          </div>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={projectMilestones.length === 0}
            className="bg-zinc-900 hover:bg-zinc-800 text-white h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-zinc-200/80 p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      {projectMilestones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            No milestones yet
          </h3>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Create a milestone first before adding tasks
          </p>
        </div>
      ) : projectTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
            Create your first task to start tracking progress
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <>
          {viewMode === "kanban" ? (
            <TasksKanbanView projectId={projectId} userId={userId} />
          ) : (
            <div className="space-y-8">
              {projectMilestones.map((milestone) => {
                const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
                if (milestoneTasks.length === 0) return null;

                return (
                  <div key={milestone.id} className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
                    {/* Milestone Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-zinc-50/50 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-lg">
                          {milestone.emoji || "🎯"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900">{milestone.name}</h3>
                          <p className="text-xs text-zinc-500">{milestoneTasks.length} tasks</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMilestoneId(milestone.id);
                          setIsCreateDialogOpen(true);
                        }}
                        className="border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 h-8 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1.5" />
                        Add Task
                      </Button>
                    </div>
                    
                    {/* Tasks */}
                    <div className="p-4 space-y-3">
                      {milestoneTasks
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((task) => (
                          <TaskCard key={task.id} task={task} userId={userId} projectId={projectId} />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        milestoneId={selectedMilestoneId}
        userId={userId}
      />
    </div>
  );
}
